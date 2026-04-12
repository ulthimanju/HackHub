package com.ehub.notification.events.ingress;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.ehub.notification.events.dedupe.NotificationDedupeService;
import com.ehub.notification.events.model.NotificationEventPayload;
import com.ehub.notification.service.EmailService;
import com.ehub.notification.util.NotificationTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(name = "application.kafka.consumer.notifications-enabled", havingValue = "true")
public class NotificationEventsConsumer {

    private final ObjectMapper objectMapper;
    private final NotificationDedupeService notificationDedupeService;
    private final EmailService emailService;

    @KafkaListener(
            topics = "${application.kafka.topics.notifications}",
            groupId = "${application.kafka.consumer.notifications-group}")
    public void consume(String rawPayload) {
        String dedupeKey = sha256(rawPayload);
        if (!notificationDedupeService.firstTime(dedupeKey)) {
            log.info("Skipping duplicate notification event");
            return;
        }

        NotificationEventPayload payload = deserialize(rawPayload);
        Map<String, Object> variables = new HashMap<>();
        variables.put("message", payload.getMessage());

        emailService.sendHtmlEmail(
                payload.getTo(),
                payload.getSubject(),
                NotificationTemplate.ALERT.getValue(),
                variables);
    }

    private NotificationEventPayload deserialize(String rawPayload) {
        try {
            return objectMapper.readValue(rawPayload, NotificationEventPayload.class);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid notification event payload", ex);
        }
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 algorithm not available", ex);
        }
    }
}