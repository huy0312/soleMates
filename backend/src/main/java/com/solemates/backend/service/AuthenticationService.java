package com.solemates.backend.service;

import com.solemates.backend.dto.AuthenticationRequest;
import com.solemates.backend.dto.AuthenticationResponse;
import com.solemates.backend.dto.RegisterRequest;
import com.solemates.backend.model.MemberProfile;
import com.solemates.backend.model.Role;
import com.solemates.backend.model.User;
import com.solemates.backend.repository.MemberProfileRepository;
import com.solemates.backend.repository.RoleRepository;
import com.solemates.backend.repository.UserRepository;
import com.solemates.backend.repository.UserRepository;
import com.solemates.backend.security.JwtUtils;
import com.solemates.backend.model.VerificationToken;
import com.solemates.backend.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

import java.util.Collections;
import java.util.UUID;
import java.time.LocalDateTime;

import com.solemates.backend.enums.UserRole;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final MemberProfileRepository memberProfileRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtils jwtUtils;
        private final AuthenticationManager authenticationManager;
        private final VerificationTokenRepository verificationTokenRepository;
        private final EmailService emailService;

        public AuthenticationResponse register(RegisterRequest request) {
                Role role = roleRepository.findByRoleName(UserRole.MEMBER)
                                .orElseThrow(() -> new RuntimeException("Default role not found"));

                var user = User.builder()
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(role)
                                .status(false) // Disable until verified
                                .build();
                userRepository.save(user);

                // Create verification token
                String token = UUID.randomUUID().toString();
                VerificationToken verificationToken = VerificationToken.builder()
                                .token(token)
                                .user(user)
                                .expiryDate(LocalDateTime.now().plusHours(24))
                                .build();
                verificationTokenRepository.save(verificationToken);

                // Send verification email
                emailService.sendVerificationEmail(user.getEmail(), token);

                var profile = MemberProfile.builder()
                                .user(user)
                                .fullName(request.getFullName())
                                .build();
                memberProfileRepository.save(profile);

                var jwtToken = jwtUtils.generateToken(new org.springframework.security.core.userdetails.User(
                                user.getEmail(),
                                user.getPassword(),
                                Collections.emptyList() // Authorities handling can be improved
                ));
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .build();
        }

        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow();
                var jwtToken = jwtUtils.generateToken(new org.springframework.security.core.userdetails.User(
                                user.getEmail(),
                                user.getPassword(),
                                Collections.emptyList()));
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .build();
        }

        public String verifyAccount(String token) {
                VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                                .orElseThrow(() -> new RuntimeException("Invalid token"));

                if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                        throw new RuntimeException("Token expired");
                }

                User user = verificationToken.getUser();
                user.setStatus(true);
                userRepository.save(user);
                verificationTokenRepository.delete(verificationToken);

                return "Account verified successfully. You can now login.";
        }
}
