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
}
