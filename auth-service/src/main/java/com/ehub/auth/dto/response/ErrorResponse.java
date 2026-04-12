package com.ehub.auth.dto.response;

import java.time.Instant;
import java.util.Map;

/**
 * Unified error response payload returned by all error handlers.
 * Provides a machine-readable {@code code} and human-readable {@code message},
 * with optional field-level {@code details} for validation failures.
 */
public record ErrorResponse(
        String code,
        String message,
        Map<String, String> details,
        String timestamp
) {
    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(code, message, null, Instant.now().toString());
    }

    public static ErrorResponse withDetails(String code, String message, Map<String, String> details) {
        return new ErrorResponse(code, message, details, Instant.now().toString());
    }
}
