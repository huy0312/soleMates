package com.solemates.backend.service;

import com.solemates.backend.enums.FriendshipStatus;
import com.solemates.backend.model.Friendship;

public interface FriendshipService {
    Friendship sendRequest(String requesterEmail, Long receiverId);

    Friendship acceptRequest(Long friendshipId, String userEmail);

    Friendship declineRequest(Long friendshipId, String userEmail);

    FriendshipStatus getFriendshipStatus(String requesterEmail, Long targetUserId);

    Friendship getFriendship(Long friendshipId);
}
