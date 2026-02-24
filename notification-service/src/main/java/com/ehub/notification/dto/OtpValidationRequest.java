package com.ehub.notification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpValidationRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String email;
    @NotBlank(message = "OTP code is required")
    private String otp;

    /** Required only for the consolidated /otp/validate endpoint. */
    private OtpPurpose purpose;
}
