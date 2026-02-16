package com.solemates.backend.service;

import com.solemates.backend.enums.FriendshipStatus;
import com.solemates.backend.model.Friendship;

public interface FriendshipService {
    Friendship sendRequest(String requesterEmail, Long receiverId);

    Friendship acceptRequest(Long friendshipId, String userEmail);

    Friendship declineRequest(Long friendshipId, String userEmail);

    FriendshipStatus getFriendshipStatus(String requesterEmail, Long targetUserId);

    java.util.Map<String, Object> getFriendshipStatusDetail(String requesterEmail, Long targetUserId);

    void cancelRequest(Long friendshipId, String userEmail);

    Friendship getFriendship(Long friendshipId);

    java.util.List<java.util.Map<String, Object>> getAcceptedFriends(String userEmail);

    java.util.List<java.util.Map<String, Object>> getPendingRequests(String userEmail);
}
