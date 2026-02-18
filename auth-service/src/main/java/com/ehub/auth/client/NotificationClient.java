package com.ehub.auth.client;

import com.ehub.auth.util.MessageKeys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import org.springframework.web.client.RestClientException;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class NotificationClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${application.notification-service.url}")
    private String baseUrl;

    public void sendOtp(String email) {
        // notification-service has /notifications/password-reset/otp
        // We will use that for registration too as it's the only one available
        String url = baseUrl.replace("/validate", "/otp");
        restTemplate.postForObject(url, Map.of("email", email), String.class);
    }

    public boolean validateOtp(String email, String otp) {
        try {
            Boolean isValid = restTemplate.postForObject(
                    baseUrl,
                    Map.of("email", email, "otp", otp),
                    Boolean.class
            );
            return Boolean.TRUE.equals(isValid);
        } catch (RestClientException e) {
            throw new RuntimeException(MessageKeys.NOTIFICATION_SERVICE_UNAVAILABLE.getMessage());
        }
    }
}
