package com.solemates.backend.controller;

import com.solemates.backend.enums.FriendshipStatus;
import com.solemates.backend.model.Friendship;
import com.solemates.backend.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    @PostMapping("/request/{userId}")
    public ResponseEntity<Friendship> sendRequest(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(friendshipService.sendRequest(userDetails.getUsername(), userId));
    }

    @PutMapping("/{friendshipId}/accept")
    public ResponseEntity<Friendship> acceptRequest(
            @PathVariable Long friendshipId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(friendshipService.acceptRequest(friendshipId, userDetails.getUsername()));
    }

    @PutMapping("/{friendshipId}/decline")
    public ResponseEntity<Friendship> declineRequest(
            @PathVariable Long friendshipId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(friendshipService.declineRequest(friendshipId, userDetails.getUsername()));
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<FriendshipStatus> getStatus(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(friendshipService.getFriendshipStatus(userDetails.getUsername(), userId));
    }
}
