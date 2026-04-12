package com.ehub.auth.shared.messages;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MessageKeys {
    USER_ALREADY_EXISTS("Username or Email already exists"),
    USER_NOT_FOUND("User not found"),
    INVALID_OTP("Invalid or expired OTP"),
    PASSWORD_RESET_SUCCESS("Password reset successfully"),
    ROLE_UPGRADE_SUCCESS("Role upgraded to organizer successfully"),
    ROLE_ALREADY_ORGANIZER("User is already an organizer"),
    REGISTRATION_OTP_SENT("Registration OTP sent successfully"),
    LOGOUT_SUCCESS("Logged out successfully"),
    SKILLS_UPDATED("Skills updated successfully"),
    NOTIFICATION_SERVICE_UNAVAILABLE("Notification service unavailable. Please try again later.");

    private final String message;
}
