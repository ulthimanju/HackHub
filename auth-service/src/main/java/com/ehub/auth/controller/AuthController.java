package com.ehub.auth.controller;

import com.ehub.auth.dto.*;
import com.ehub.auth.entity.User;
import com.ehub.auth.service.AuthService;
import com.ehub.auth.util.MessageKeys;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(Authentication authentication) {
        if (authentication.getPrincipal() instanceof User user) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.ok(service.getProfile(authentication.getName()));
    }

    @PutMapping("/profile/skills")
    public ResponseEntity<String> updateSkills(Authentication authentication, @RequestBody List<String> skills) {
        service.updateSkills(authentication.getName(), skills);
        return ResponseEntity.ok("Skills updated successfully");
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
    public ResponseEntity<String> requestRegistrationOtp(@RequestParam String email) {
        service.requestRegistrationOtp(email);
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
    public ResponseEntity<String> requestRoleUpgradeOtp(@RequestParam String email) {
        service.requestRoleUpgradeOtp(email);
        return ResponseEntity.ok(MessageKeys.REGISTRATION_OTP_SENT.getMessage());
    }

    @PostMapping("/upgrade-role")
    public ResponseEntity<String> upgradeToOrganizer(@Valid @RequestBody RoleUpgradeRequest request) {
        service.upgradeToOrganizer(request);
        return ResponseEntity.ok(MessageKeys.ROLE_UPGRADE_SUCCESS.getMessage());
    }

    @GetMapping("/validate-token")
    public ResponseEntity<Boolean> validateToken(@RequestParam String token) {
        return ResponseEntity.ok(service.validateToken(token));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        // In a stateless JWT implementation, logout is typically handled on the client side 
        // by deleting the token. Server-side logout can involve blacklisting (not implemented here).
        return ResponseEntity.ok(MessageKeys.LOGOUT_SUCCESS.getMessage());
    }
}
