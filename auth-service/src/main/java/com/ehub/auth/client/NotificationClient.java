package com.ehub.auth.client;

import com.ehub.auth.util.MessageKeys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@Slf4j
public class NotificationClient {

    private final RestTemplate restTemplate;

    @Value("${application.notification-service.base-url:http://notification-service:8082/notifications}")
    private String baseUrl;

    public NotificationClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(4000);
        this.restTemplate = new RestTemplate(factory);
    }

    public void sendRegistrationOtp(String email) {
        sendOtp(email, "/registration/otp");
    }

    public void sendPasswordResetOtp(String email) {
        sendOtp(email, "/password-reset/otp");
    }

    public void sendRoleUpgradeOtp(String email) {
        sendOtp(email, "/role-upgrade/otp");
    }

    /** @deprecated use the typed methods above */
    public void sendOtp(String email) {
        sendRegistrationOtp(email);
    }

    private void sendOtp(String email, String path) {
        try {
            restTemplate.postForObject(baseUrl + path, Map.of("email", email), String.class);
        } catch (RestClientException e) {
            log.warn("Could not send OTP email to {}: {}", email, e.getMessage());
        }
    }

    public boolean validateOtp(String email, String otp) {
        return validateOtp(email, otp, "/registration/validate");
    }

    public boolean validateRegistrationOtp(String email, String otp) {
        return validateOtp(email, otp, "/registration/validate");
    }

    public boolean validatePasswordResetOtp(String email, String otp) {
        return validateOtp(email, otp, "/password-reset/validate");
    }

    public boolean validateRoleUpgradeOtp(String email, String otp) {
        return validateOtp(email, otp, "/role-upgrade/validate");
    }

    private boolean validateOtp(String email, String otp, String path) {
        try {
            Boolean isValid = restTemplate.postForObject(
                    baseUrl + path,
                    Map.of("email", email, "otp", otp),
                    Boolean.class
            );
            return Boolean.TRUE.equals(isValid);
        } catch (RestClientException e) {
            throw new RuntimeException(MessageKeys.NOTIFICATION_SERVICE_UNAVAILABLE.getMessage());
        }
    }
}
