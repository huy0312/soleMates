package com.solemates.backend.service.impl;

import com.solemates.backend.dto.UpdateProfileRequest;
import com.solemates.backend.dto.UserDTO;
import com.solemates.backend.model.MemberProfile;
import com.solemates.backend.model.User;
import com.solemates.backend.repository.MemberProfileRepository;
import com.solemates.backend.repository.UserRepository;
import com.solemates.backend.service.UserService;
import com.solemates.backend.util.RankUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final MemberProfileRepository memberProfileRepository;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    @Override
    public UserDTO getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MemberProfile profile = memberProfileRepository.findByUser(user)
                .orElse(null);

        return mapToDTO(user, profile);
    }

    @Override
    @Transactional
    public UserDTO updateUserProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MemberProfile profile = memberProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        if (request.getFullName() != null)
            profile.setFullName(request.getFullName());
        if (request.getGender() != null)
            profile.setGender(request.getGender());
        if (request.getBirthDate() != null) {
            profile.setBirthDate(request.getBirthDate());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }
        if (request.getAvatarUrl() != null) {
            profile.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getCoverPhotoUrl() != null) {
            profile.setCoverPhotoUrl(request.getCoverPhotoUrl());
        }
        if (request.getAddress() != null)
            profile.setAddress(request.getAddress());
        if (request.getTelephone() != null)
            profile.setTelephone(request.getTelephone());
        if (request.getShowEmail() != null)
            profile.setShowEmail(request.getShowEmail());
        if (request.getShowPhone() != null)
            profile.setShowPhone(request.getShowPhone());
        if (request.getShowAddress() != null)
            profile.setShowAddress(request.getShowAddress());
        if (request.getShowBirthday() != null)
            profile.setShowBirthday(request.getShowBirthday());

        MemberProfile savedProfile = memberProfileRepository.save(profile);
        return mapToDTO(user, savedProfile);
    }

    @Override
    public UserDTO getUserPublicProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MemberProfile profile = memberProfileRepository.findByUser(user)
                .orElse(null);

        return mapToDTO(user, profile);
    }

    @Override
    public List<UserDTO> searchUsers(String keyword) {
        List<User> users = userRepository.searchUsers(keyword);
        return users.stream()
                .map(user -> {
                    MemberProfile profile = memberProfileRepository.findByUser(user).orElse(null);
                    return mapToDTO(user, profile);
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public UserDTO getUserByShareToken(String token) {
        User user = userRepository.findByShareToken(token)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MemberProfile profile = memberProfileRepository.findByUser(user)
                .orElse(null);

        return mapToDTO(user, profile);
    }

    @Override
    @Transactional
    public UserDTO generateShareToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getUsername() == null) {
            user.setUsername(generateUniqueUsername(email));
        }
        if (user.getReferralCode() == null) {
            user.setReferralCode(generateUniqueReferralCode());
        }

        user.setShareToken(java.util.UUID.randomUUID().toString());
        userRepository.save(user);

        MemberProfile profile = memberProfileRepository.findByUser(user)
                .orElse(null);

        return mapToDTO(user, profile);
    }

    private UserDTO mapToDTO(User user, MemberProfile profile) {
        // Calculate Rank
        int points = profile != null && profile.getPoints() != null ? profile.getPoints() : 0;
        String rank = RankUtil.getRankName(points);
        Integer nextThreshold = RankUtil.getNextRankThreshold(points);
        Double progress = RankUtil.getRankProgress(points);

        return UserDTO.builder()
                .id(user.getUserId())
                .email(user.getEmail())
                .username(user.getUsername())
                .referralCode(user.getReferralCode())
                .shareToken(user.getShareToken())
                .role(user.getRole().getRoleName())
                .fullName(profile != null ? profile.getFullName() : null)
                .gender(profile != null ? profile.getGender() : null)
                .birthDate(profile != null ? profile.getBirthDate() : null)
                .joinDate(user.getCreatedAt() != null ? user.getCreatedAt().toLocalDate() : null)
                .avatarUrl(profile != null ? profile.getAvatarUrl() : null)
                .bio(profile != null ? profile.getBio() : null)
                .coverPhotoUrl(profile != null ? profile.getCoverPhotoUrl() : null)
                .address(profile != null ? profile.getAddress() : null)
                .telephone(profile != null ? profile.getTelephone() : null)
                .showEmail(profile != null && Boolean.TRUE.equals(profile.getShowEmail()))
                .showPhone(profile != null && Boolean.TRUE.equals(profile.getShowPhone()))
                .showAddress(profile != null && Boolean.TRUE.equals(profile.getShowAddress()))
                .showBirthday(profile != null && Boolean.TRUE.equals(profile.getShowBirthday()))
                .points(points)
                .rank(rank)
                .nextRankThreshold(nextThreshold)
                .rankProgress(progress)
                .stravaId(user.getStravaId())
                .build();
    }

    private String generateUniqueUsername(String email) {
        String baseUsername = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
        String username = baseUsername;
        int count = 1;
        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + count++;
        }
        return username;
    }

    private String generateUniqueReferralCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();
        java.util.Random rnd = new java.util.Random();
        while (code.length() == 0 || userRepository.findByReferralCode(code.toString()).isPresent()) {
            code.setLength(0); // Reset
            for (int i = 0; i < 8; i++) {
                code.append(chars.charAt(rnd.nextInt(chars.length())));
            }
        }
        return code.toString();
    }

    @Override
    @Transactional
    public UserDTO updateShareToken(String email, String newToken) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!newToken.matches("^[a-zA-Z0-9._-]{3,30}$")) {
            throw new RuntimeException(
                    "Link không hợp lệ. Chỉ chấp nhận chữ, số, dấu chấm, gạch dưới và gạch ngang (3-30 ký tự).");
        }

        Optional<User> existingUser = userRepository.findByShareToken(newToken);
        if (existingUser.isPresent() && !existingUser.get().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Link này đã có người sử dụng.");
        }

        user.setShareToken(newToken);
        userRepository.save(user);

        MemberProfile profile = memberProfileRepository.findByUser(user)
                .orElse(null);

        return mapToDTO(user, profile);
    }
}
