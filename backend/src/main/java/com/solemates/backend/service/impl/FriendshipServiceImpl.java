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
            throw new RuntimeException("Friendship or request already exists");
        }

        Friendship friendship = Friendship.builder()
                .requester(requester)
                .receiver(receiver)
                .status(FriendshipStatus.PENDING)
                .build();

        return friendshipRepository.save(friendship);
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
        return friendshipRepository.save(friendship);
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
    public Friendship getFriendship(Long friendshipId) {
        return friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship not found"));
    }
}
