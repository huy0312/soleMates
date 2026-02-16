package com.solemates.backend.service.impl;

import com.solemates.backend.enums.FriendshipStatus;
import com.solemates.backend.model.Friendship;
import com.solemates.backend.model.User;
import com.solemates.backend.repository.FriendshipRepository;
import com.solemates.backend.repository.UserRepository;
import com.solemates.backend.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FriendshipServiceImpl implements FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public Friendship sendRequest(String requesterEmail, Long receiverId) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (requester.getUserId().equals(receiver.getUserId())) {
            throw new RuntimeException("Cannot send friend request to yourself");
        }

        Optional<Friendship> existing = friendshipRepository.findFriendshipBetween(requester, receiver);
        if (existing.isPresent()) {
            Friendship f = existing.get();
            if (f.getStatus() == FriendshipStatus.DECLINED) {
                // Check 12-hour cooldown
                java.time.LocalDateTime declinedTime = f.getUpdatedAt();
                if (declinedTime != null && declinedTime.plusHours(12).isAfter(java.time.LocalDateTime.now())) {
                    long minutesLeft = java.time.Duration
                            .between(java.time.LocalDateTime.now(), declinedTime.plusHours(12)).toMinutes();
                    long hoursLeft = minutesLeft / 60;
                    long minsLeft = minutesLeft % 60;
                    throw new RuntimeException("Lời mời đã bị từ chối. Vui lòng đợi " + hoursLeft + " giờ " + minsLeft
                            + " phút nữa để gửi lại.");
                }
                // Cooldown passed, delete old record and allow re-request
                friendshipRepository.delete(f);
            } else {
                throw new RuntimeException("Friendship or request already exists");
            }
        }

        Friendship friendship = Friendship.builder()
                .requester(requester)
                .receiver(receiver)
                .status(FriendshipStatus.PENDING)
                .build();

        Friendship saved = friendshipRepository.save(friendship);

        // Send notification via WebSocket
        java.util.Map<String, Object> notification = new java.util.HashMap<>();
        notification.put("type", "FRIEND_REQUEST");
        notification.put("friendshipId", saved.getId());
        notification.put("id", requester.getUserId());
        notification.put("username", requester.getUsername());
        notification.put("email", requester.getEmail());
        com.solemates.backend.model.MemberProfile profile = requester.getMemberProfile();
        notification.put("avatarUrl", profile != null ? profile.getAvatarUrl() : null);
        notification.put("shareToken", requester.getShareToken());
        notification.put("fullName", profile != null ? profile.getFullName() : requester.getUsername());

        messagingTemplate.convertAndSend("/topic/notifications/" + receiver.getUserId(), (Object) notification);

        return saved;
    }

    @Override
    @Transactional
    public Friendship acceptRequest(Long friendshipId, String userEmail) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship not found"));

        if (!friendship.getReceiver().getEmail().equals(userEmail)) {
            throw new RuntimeException("Not authorized to accept this request");
        }

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("Friendship is not in pending state");
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        Friendship saved = friendshipRepository.save(friendship);

        // Send acceptance notification to requester
        User receiver = friendship.getReceiver();
        User requester = friendship.getRequester();

        java.util.Map<String, Object> notification = new java.util.HashMap<>();
        notification.put("type", "FRIEND_ACCEPT");
        notification.put("friendshipId", saved.getId());
        notification.put("id", receiver.getUserId());
        notification.put("username", receiver.getUsername());
        com.solemates.backend.model.MemberProfile profile = receiver.getMemberProfile();
        notification.put("avatarUrl", profile != null ? profile.getAvatarUrl() : null);
        notification.put("fullName", profile != null ? profile.getFullName() : receiver.getUsername());

        messagingTemplate.convertAndSend("/topic/notifications/" + requester.getUserId(), (Object) notification);

        return saved;
    }

    @Override
    @Transactional
    public Friendship declineRequest(Long friendshipId, String userEmail) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship not found"));

        if (!friendship.getReceiver().getEmail().equals(userEmail)) {
            throw new RuntimeException("Not authorized to decline this request");
        }

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("Friendship is not in pending state");
        }

        friendship.setStatus(FriendshipStatus.DECLINED);
        return friendshipRepository.save(friendship);
    }

    @Override
    public FriendshipStatus getFriendshipStatus(String requesterEmail, Long targetUserId) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        return friendshipRepository.findFriendshipBetween(requester, target)
                .map(Friendship::getStatus)
                .orElse(null); // No relationship
    }

    @Override
    public java.util.Map<String, Object> getFriendshipStatusDetail(String requesterEmail, Long targetUserId) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        return friendshipRepository.findFriendshipBetween(requester, target)
                .map(f -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("status", f.getStatus());
                    map.put("friendshipId", f.getId());
                    map.put("direction",
                            f.getRequester().getUserId().equals(requester.getUserId()) ? "SENT" : "RECEIVED");
                    return map;
                })
                .orElse(null);
    }

    @Override
    @Transactional
    public void cancelRequest(Long friendshipId, String userEmail) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship not found"));

        if (!friendship.getRequester().getEmail().equals(userEmail)) {
            throw new RuntimeException("Not authorized to cancel this request");
        }

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("Can only cancel pending requests");
        }

        friendshipRepository.delete(friendship);
    }

    @Override
    public Friendship getFriendship(Long friendshipId) {
        return friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship not found"));
    }

    @Override
    public java.util.List<java.util.Map<String, Object>> getAcceptedFriends(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        java.util.List<Friendship> friendships = friendshipRepository.findAllByUserAndStatus(user,
                FriendshipStatus.ACCEPTED);
        java.util.List<java.util.Map<String, Object>> friends = new java.util.ArrayList<>();

        for (Friendship f : friendships) {
            User friend = f.getRequester().getUserId().equals(user.getUserId()) ? f.getReceiver() : f.getRequester();
            com.solemates.backend.model.MemberProfile profile = friend.getMemberProfile();
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", friend.getUserId());
            map.put("username", friend.getUsername());
            map.put("email", friend.getEmail());
            map.put("avatarUrl", profile != null ? profile.getAvatarUrl() : null);
            map.put("shareToken", friend.getShareToken());
            map.put("fullName", profile != null ? profile.getFullName() : friend.getUsername());
            friends.add(map);
        }
        return friends;
    }

    @Override
    public java.util.List<java.util.Map<String, Object>> getPendingRequests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        java.util.List<Friendship> pending = friendshipRepository.findByReceiverAndStatus(user,
                FriendshipStatus.PENDING);
        java.util.List<java.util.Map<String, Object>> requests = new java.util.ArrayList<>();

        for (Friendship f : pending) {
            User requester = f.getRequester();
            com.solemates.backend.model.MemberProfile profile = requester.getMemberProfile();
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("friendshipId", f.getId());
            map.put("id", requester.getUserId());
            map.put("username", requester.getUsername());
            map.put("email", requester.getEmail());
            map.put("avatarUrl", profile != null ? profile.getAvatarUrl() : null);
            map.put("shareToken", requester.getShareToken());
            map.put("fullName", profile != null ? profile.getFullName() : requester.getUsername());
            requests.add(map);
        }
        return requests;
    }
}
