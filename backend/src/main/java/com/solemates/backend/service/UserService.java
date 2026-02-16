package com.solemates.backend.service;

import com.solemates.backend.dto.UpdateProfileRequest;
import com.solemates.backend.dto.UserDTO;
import com.solemates.backend.model.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> getAllUsers();

    Optional<User> getUserById(Long id);

    Optional<User> getUserByEmail(String email);

    User saveUser(User user);

    void deleteUser(Long id);

    boolean existsByEmail(String email);

    UserDTO getUserProfile(String email);

    UserDTO updateUserProfile(String email, UpdateProfileRequest request);

    UserDTO getUserPublicProfile(String username);

    List<UserDTO> searchUsers(String keyword);

    UserDTO getUserByShareToken(String token);

    UserDTO generateShareToken(String email);

    UserDTO updateShareToken(String email, String newToken);
}
