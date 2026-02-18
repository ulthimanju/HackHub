package com.ehub.notification.controller;

import com.ehub.notification.dto.EmailRequest;
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

    @PostMapping("/password-reset/otp")
    public ResponseEntity<String> sendPasswordResetOtp(@Valid @RequestBody OtpRequest request) {
        return sendOtp(request.getEmail(), "Password Reset OTP");
    }

    @PostMapping("/registration/otp")
    public ResponseEntity<String> sendRegistrationOtp(@Valid @RequestBody OtpRequest request) {
        return sendOtp(request.getEmail(), "Registration OTP");
    }

    @PostMapping("/role-upgrade/otp")
    public ResponseEntity<String> sendRoleUpgradeOtp(@Valid @RequestBody OtpRequest request) {
        return sendOtp(request.getEmail(), "Role Upgrade OTP");
    }

    private ResponseEntity<String> sendOtp(String email, String subject) {
        String otp = otpService.generateOtp(email);
        Map<String, Object> variables = new HashMap<>();
        variables.put("otp", otp);
        emailService.sendHtmlEmail(email, subject, NotificationTemplate.OTP.getValue(), variables);
        return ResponseEntity.ok(MessageKeys.OTP_SENT_SUCCESS.getMessage());
    }

    @PostMapping("/password-reset/validate")
    public ResponseEntity<Boolean> validateOtp(@Valid @RequestBody OtpValidationRequest request) {
        boolean isValid = otpService.validateOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(isValid);
    }

    @PostMapping("/registration/validate")
    public ResponseEntity<Boolean> validateRegistrationOtp(@Valid @RequestBody OtpValidationRequest request) {
        return validateOtp(request);
    }

    @PostMapping("/role-upgrade/validate")
    public ResponseEntity<Boolean> validateRoleUpgradeOtp(@Valid @RequestBody OtpValidationRequest request) {
        return validateOtp(request);
    }
}
