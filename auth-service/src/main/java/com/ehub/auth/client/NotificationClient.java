package com.ehub.auth.client;

import com.ehub.auth.util.MessageKeys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Map;

@Component
@Slf4j
public class NotificationClient {

    private final RestTemplate restTemplate;

    @Value("${application.notification-service.url}")
    private String baseUrl;

    public NotificationClient() {
        this.restTemplate = new RestTemplateBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .readTimeout(Duration.ofSeconds(4))
                .build();
    }

    public void sendOtp(String email) {
        try {
            String url = baseUrl.replace("/validate", "/otp");
            restTemplate.postForObject(url, Map.of("email", email), String.class);
        } catch (RestClientException e) {
            log.warn("Could not send OTP email to {}: {}", email, e.getMessage());
        }
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
