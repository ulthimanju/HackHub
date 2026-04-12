package com.ehub.auth.service;

import com.ehub.auth.dto.*;
import com.ehub.auth.entity.User;
import com.ehub.auth.outbound.notification.NotificationClient;
import com.ehub.auth.repository.UserRepository;
import com.ehub.auth.security.JwtService;
import com.ehub.auth.security.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.ehub.auth.enums.UserRole;
import com.ehub.auth.util.MessageKeys;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final NotificationClient notificationClient;
    private final TokenBlacklistService tokenBlacklistService;

    public void requestRegistrationOtp(String email) {
        if (repository.existsByEmail(email)) {
            throw new RuntimeException(MessageKeys.USER_ALREADY_EXISTS.getMessage());
        }
        notificationClient.sendRegistrationOtp(email);
    }

    public AuthenticationResponse register(RegisterRequest request) {
        // 1. Validate OTP
        if (!notificationClient.validateRegistrationOtp(request.getEmail(), request.getOtp())) {
            throw new RuntimeException(MessageKeys.USER_ALREADY_EXISTS.getMessage());
        }

        String uuid = UUID.randomUUID().toString();

        var user = User.builder()
                .id(uuid)
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .role(UserRole.PARTICIPANT)
                .build();
        try {
            repository.save(user);
        } catch (DataIntegrityViolationException e) {
            // Handles race condition where another request registered the same username/email concurrently
            throw new RuntimeException(MessageKeys.USER_ALREADY_EXISTS.getMessage());
        }
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .user(mapToUserResponse(user))
                .build();
    }

    public AuthenticationResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        var user = repository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .user(mapToUserResponse(user))
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .email(user.getEmail())
                .role(user.getRole())
                .skills(user.getSkills())
                .bio(user.getBio())
                .githubUrl(user.getGithubUrl())
                .linkedinUrl(user.getLinkedinUrl())
                .portfolioUrl(user.getPortfolioUrl())
                .experienceLevel(user.getExperienceLevel())
                .openToInvites(user.isOpenToInvites())
                .build();
    }

    public void requestPasswordResetOtp(String email) {
        repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException(MessageKeys.USER_NOT_FOUND.getMessage()));
        notificationClient.sendPasswordResetOtp(email);
    }

    public void resetPassword(PasswordResetRequest request) {
        // 1. Validate OTP
        if (!notificationClient.validatePasswordResetOtp(request.getEmail(), request.getOtp())) {
            throw new RuntimeException(MessageKeys.INVALID_OTP.getMessage());
        }

        // 2. Update Password
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException(MessageKeys.USER_NOT_FOUND.getMessage()));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        repository.save(user);
    }

    public void requestRoleUpgradeOtp(String username) {
        var user = repository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException(MessageKeys.USER_NOT_FOUND.getMessage()));

        if (UserRole.ORGANIZER.equals(user.getRole())) {
            throw new RuntimeException(MessageKeys.ROLE_ALREADY_ORGANIZER.getMessage());
        }

        notificationClient.sendRoleUpgradeOtp(user.getEmail());
    }

    public AuthenticationResponse upgradeToOrganizer(String username, String otp, String currentToken) {
        var user = repository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException(MessageKeys.USER_NOT_FOUND.getMessage()));

        // 1. Validate OTP against the user's own email
        if (!notificationClient.validateRoleUpgradeOtp(user.getEmail(), otp)) {
            throw new RuntimeException(MessageKeys.INVALID_OTP.getMessage());
        }

        // 2. Update Role
        user.setRole(UserRole.ORGANIZER);
        repository.save(user);

        // 3. Blacklist old token so it can no longer be used with PARTICIPANT claims
        if (currentToken != null) {
            tokenBlacklistService.blacklist(
                    jwtService.extractJti(currentToken),
                    jwtService.getExpirationMillis(currentToken)
            );
        }

        // 4. Issue a new token with updated ORGANIZER role
        var newToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(newToken)
                .user(mapToUserResponse(user))
                .build();
    }

    public void logout(String token) {
        if (token != null) {
            tokenBlacklistService.blacklist(
                    jwtService.extractJti(token),
                    jwtService.getExpirationMillis(token)
            );
        }
    }

    public User getProfile(String username) {
        return repository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException(MessageKeys.USER_NOT_FOUND.getMessage()));
    }

    public UserResponse updateProfile(String currentUsername, UpdateProfileRequest request) {
        User user = repository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException(MessageKeys.USER_NOT_FOUND.getMessage()));

        // Username changes are intentionally disallowed: the JWT subject is the username,
        // so changing it would silently invalidate all existing tokens.
        if (request.getSkills() != null) {
            user.setSkills(request.getSkills());
        }
        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName().isBlank() ? null : request.getDisplayName().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().isBlank() ? null : request.getBio().trim());
        }
        if (request.getGithubUrl() != null) {
            user.setGithubUrl(request.getGithubUrl().isBlank() ? null : request.getGithubUrl().trim());
        }
        if (request.getLinkedinUrl() != null) {
            user.setLinkedinUrl(request.getLinkedinUrl().isBlank() ? null : request.getLinkedinUrl().trim());
        }
        if (request.getPortfolioUrl() != null) {
            user.setPortfolioUrl(request.getPortfolioUrl().isBlank() ? null : request.getPortfolioUrl().trim());
        }
        if (request.getExperienceLevel() != null) {
            user.setExperienceLevel(request.getExperienceLevel());
        }
        if (request.getOpenToInvites() != null) {
            user.setOpenToInvites(request.getOpenToInvites());
        }

        repository.save(user);
        return mapToUserResponse(user);
    }

    public void updateSkills(String username, List<String> skills) {
        User user = repository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException(MessageKeys.USER_NOT_FOUND.getMessage()));
        user.setSkills(skills);
        repository.save(user);
    }

    public List<User> getUsersBySkills(List<String> skills) {
        // Simple implementation: filter in memory or use a native query for JSONB
        // For production, a native query like "skills ?| array['skill1', 'skill2']" would be better
        return repository.findAll().stream()
                .filter(u -> u.getSkills() != null && !Collections.disjoint(u.getSkills(), skills))
                .collect(Collectors.toList());
    }

    public boolean validateToken(String token) {
        try {
            String username = jwtService.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            return jwtService.isTokenValid(token, userDetails);
        } catch (Exception e) {
            return false;
        }
    }
}
