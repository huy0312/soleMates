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
import com.solemates.backend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

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

        public AuthenticationResponse register(RegisterRequest request) {
                Role role = roleRepository.findByRoleName(UserRole.MEMBER)
                                .orElseThrow(() -> new RuntimeException("Default role not found"));

                var user = User.builder()
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(role)
                                .status(true)
                                .build();
                userRepository.save(user);

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
}
