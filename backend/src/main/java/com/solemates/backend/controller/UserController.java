package com.solemates.backend.controller;

import com.solemates.backend.dto.UpdateProfileRequest;
import com.solemates.backend.dto.UserDTO;
import com.solemates.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUserProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getUserProfile(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateCurrentUserProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateUserProfile(authentication.getName(), request));
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserDTO> getUserPublicProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserPublicProfile(username));
    }

    @GetMapping("/search")
    public ResponseEntity<java.util.List<UserDTO>> searchUsers(@RequestParam String q) {
        return ResponseEntity.ok(userService.searchUsers(q));
    }

    @GetMapping("/profile/{token}")
    public ResponseEntity<UserDTO> getUserProfileByToken(@PathVariable String token) {
        return ResponseEntity.ok(userService.getUserByShareToken(token));
    }

    @PostMapping("/generate-token")
    public ResponseEntity<UserDTO> generateToken(Authentication authentication) {
        return ResponseEntity.ok(userService.generateShareToken(authentication.getName()));
    }

    @PutMapping("/share-token")
    public ResponseEntity<UserDTO> updateShareToken(Authentication authentication,
            @RequestBody java.util.Map<String, String> body) {
        String newToken = body.get("token");
        return ResponseEntity.ok(userService.updateShareToken(authentication.getName(), newToken));
    }
}
