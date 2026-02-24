package com.ehub.notification.controller;

import com.ehub.notification.dto.EmailRequest;
import com.ehub.notification.dto.OtpPurpose;
import com.ehub.notification.dto.OtpRequest;
import com.ehub.notification.dto.OtpValidationRequest;
import com.ehub.notification.service.EmailService;
import com.ehub.notification.service.OtpService;
import com.ehub.notification.util.MessageKeys;
import com.ehub.notification.util.NotificationTemplate;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final EmailService emailService;
    private final OtpService otpService;

    @PostMapping("/send-alert")
    public ResponseEntity<String> sendAlert(@Valid @RequestBody EmailRequest request) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("message", request.getMessage());
        emailService.sendHtmlEmail(request.getTo(), request.getSubject(), NotificationTemplate.ALERT.getValue(), variables);
        return ResponseEntity.ok(MessageKeys.ALERT_SENT_SUCCESS.getMessage());
    }

    // --- Per-purpose send endpoints (existing, kept for backward compatibility) ---

    @PostMapping("/password-reset/otp")
    public ResponseEntity<String> sendPasswordResetOtp(@Valid @RequestBody OtpRequest request) {
        return sendOtp(request.getEmail(), OtpPurpose.PASSWORD_RESET, "Password Reset OTP");
    }

    @PostMapping("/registration/otp")
    public ResponseEntity<String> sendRegistrationOtp(@Valid @RequestBody OtpRequest request) {
        return sendOtp(request.getEmail(), OtpPurpose.EMAIL_VERIFICATION, "Registration OTP");
    }

    @PostMapping("/role-upgrade/otp")
    public ResponseEntity<String> sendRoleUpgradeOtp(@Valid @RequestBody OtpRequest request) {
        return sendOtp(request.getEmail(), OtpPurpose.ROLE_UPGRADE, "Role Upgrade OTP");
    }

    // --- Per-purpose validate endpoints (existing, kept for backward compatibility) ---

    @PostMapping("/password-reset/validate")
    public ResponseEntity<Boolean> validatePasswordResetOtp(@Valid @RequestBody OtpValidationRequest request) {
        return ResponseEntity.ok(otpService.validateOtp(request.getEmail(), request.getOtp(), OtpPurpose.PASSWORD_RESET));
    }

    @PostMapping("/registration/validate")
    public ResponseEntity<Boolean> validateRegistrationOtp(@Valid @RequestBody OtpValidationRequest request) {
        return ResponseEntity.ok(otpService.validateOtp(request.getEmail(), request.getOtp(), OtpPurpose.EMAIL_VERIFICATION));
    }

    @PostMapping("/role-upgrade/validate")
    public ResponseEntity<Boolean> validateRoleUpgradeOtp(@Valid @RequestBody OtpValidationRequest request) {
        return ResponseEntity.ok(otpService.validateOtp(request.getEmail(), request.getOtp(), OtpPurpose.ROLE_UPGRADE));
    }

    // --- Consolidated endpoints (new) ---

    @PostMapping("/otp/generate")
    public ResponseEntity<String> generateOtp(@Valid @RequestBody OtpRequest request) {
        if (request.getPurpose() == null) {
            throw new IllegalArgumentException("Purpose is required. Valid values: EMAIL_VERIFICATION, PASSWORD_RESET, ROLE_UPGRADE");
        }
        String raw = request.getPurpose().name().replace('_', ' ');
        String subject = Character.toUpperCase(raw.charAt(0)) + raw.substring(1).toLowerCase() + " OTP";
        return sendOtp(request.getEmail(), request.getPurpose(), subject);
    }

    @PostMapping("/otp/validate")
    public ResponseEntity<Boolean> validateOtp(@Valid @RequestBody OtpValidationRequest request) {
        if (request.getPurpose() == null) {
            throw new IllegalArgumentException("Purpose is required. Valid values: EMAIL_VERIFICATION, PASSWORD_RESET, ROLE_UPGRADE");
        }
        return ResponseEntity.ok(otpService.validateOtp(request.getEmail(), request.getOtp(), request.getPurpose()));
    }

    // --- Internal helpers ---

    private ResponseEntity<String> sendOtp(String email, OtpPurpose purpose, String subject) {
        String otp = otpService.generateOtp(email, purpose);
        Map<String, Object> variables = new HashMap<>();
        variables.put("otp", otp);
        emailService.sendHtmlEmail(email, subject, NotificationTemplate.OTP.getValue(), variables);
        return ResponseEntity.ok(MessageKeys.OTP_SENT_SUCCESS.getMessage());
    }
}
