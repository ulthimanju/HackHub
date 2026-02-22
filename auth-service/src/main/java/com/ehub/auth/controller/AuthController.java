package com.ehub.auth.controller;

import com.ehub.auth.dto.*;
import com.ehub.auth.entity.User;
import com.ehub.auth.service.AuthService;
import com.ehub.auth.util.MessageKeys;
import com.ehub.auth.enums.UserRole;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(Authentication authentication) {
        User user = service.getProfile(authentication.getName());
        return ResponseEntity.ok(UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .skills(user.getSkills())
                .build());
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(Authentication authentication, @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(service.updateProfile(authentication.getName(), request));
    }

    @PutMapping("/profile/skills")
    public ResponseEntity<String> updateSkills(Authentication authentication, @RequestBody List<String> skills) {
        service.updateSkills(authentication.getName(), skills);
        return ResponseEntity.ok(MessageKeys.SKILLS_UPDATED.getMessage());
    }

    @PostMapping("/search/by-skills")
    public ResponseEntity<List<User>> getUsersBySkills(@RequestBody List<String> skills) {
        return ResponseEntity.ok(service.getUsersBySkills(skills));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/register/otp")
    public ResponseEntity<String> requestRegistrationOtp(@RequestBody Map<String, String> body) {
        service.requestRegistrationOtp(body.get("email"));
        return ResponseEntity.ok(MessageKeys.REGISTRATION_OTP_SENT.getMessage());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(service.login(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        service.resetPassword(request);
        return ResponseEntity.ok(MessageKeys.PASSWORD_RESET_SUCCESS.getMessage());
    }

    @PostMapping("/upgrade-role/otp")
    public ResponseEntity<String> requestRoleUpgradeOtp(Authentication authentication) {
        service.requestRoleUpgradeOtp(authentication.getName());
        return ResponseEntity.ok(MessageKeys.REGISTRATION_OTP_SENT.getMessage());
    }

    @PostMapping("/upgrade-role")
    public ResponseEntity<AuthenticationResponse> upgradeToOrganizer(
            Authentication authentication,
            @RequestBody Map<String, String> body,
            HttpServletRequest httpRequest) {
        String otp = body.get("otp");
        if (otp == null || otp.isBlank()) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(service.upgradeToOrganizer(authentication.getName(), otp, extractToken(httpRequest)));
    }

    @GetMapping("/validate-token")
    public ResponseEntity<Boolean> validateToken(@RequestParam String token) {
        return ResponseEntity.ok(service.validateToken(token));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        service.logout(extractToken(request));
        return ResponseEntity.ok(MessageKeys.LOGOUT_SUCCESS.getMessage());
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        return (header != null && header.startsWith("Bearer ")) ? header.substring(7) : null;
    }
}
