package com.ehub.notification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EmailRequest {
    @NotBlank(message = "Recipient email is required")
    @Email(message = "Please enter a valid email address")
    private String to;
    @NotBlank(message = "Subject is required")
    private String subject;
    @NotBlank(message = "Message body is required")
    private String message;
}
