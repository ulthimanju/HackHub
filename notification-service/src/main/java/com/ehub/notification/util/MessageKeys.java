package com.ehub.notification.util;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MessageKeys {
    RATE_LIMIT_EXCEEDED("Rate limit exceeded. Please try again after %d minutes."),
    ALERT_SENT_SUCCESS("Alert sent successfully"),
    OTP_SENT_SUCCESS("OTP sent successfully"),
    EMAIL_SENDING_FAILED("Email sending failed"),
    OTP_TOO_MANY_ATTEMPTS("Too many failed OTP attempts. Your code has been invalidated. Please request a new one after %d minutes.");

    private final String message;
}
