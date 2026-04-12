package com.ehub.event.service;

import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ehub.event.client.NotificationClient;
import com.ehub.event.entity.Event;
import com.ehub.event.enums.EventStatus;
import com.ehub.event.repository.RegistrationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class MissionNotificationService {

    private final NotificationClient notificationClient;
    private final RegistrationRepository registrationRepository;
    private final OutboxService outboxService;

    @Value("${application.outbox.notifications-enabled:true}")
    private boolean outboxNotificationsEnabled;

    public void notifyTransition(Event event, EventStatus to) {
        String subject = "";
        String message = "";

        switch (to) {
            case ONGOING -> {
                subject = "MISSION START: " + event.getName() + " is now LIVE!";
                message = "The hackathon has officially started. You can now start building and submitting your projects. Good luck!";
            }
            case REGISTRATION_OPEN -> {
                subject = "REGISTRATION OPEN: " + event.getName();
                message = "Registration for " + event.getName() + " is now open. Secure your spot now!";
            }
            case JUDGING -> {
                subject = "SUBMISSION CLOSED: " + event.getName() + " judging phase started.";
                message = "The hackathon submission period has ended. Our AI and organizers are now evaluating the projects.";
            }
            case RESULTS_ANNOUNCED -> {
                subject = "RESULTS ANNOUNCED: " + event.getName();
                message = "The final rankings for " + event.getName()
                        + " have been released. Head over to the event page to see the winners!";
            }
            default -> {
            }
        }

        if (!subject.isEmpty()) {
            broadcastToParticipants(event.getId(), subject, message);
        }
    }

    private void broadcastToParticipants(String eventId, String subject, String message) {
        List<String> emails = registrationRepository.findByEventId(eventId).stream()
                .map(com.ehub.event.entity.Registration::getUserEmail)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        for (String email : emails) {
            if (outboxNotificationsEnabled) {
                enqueueNotification(eventId, email, subject, message);
            }

            try {
                notificationClient.sendEmail(email, subject, message);
            } catch (Exception e) {
                log.warn("Failed to send notification to {}", email, e);
            }
        }
    }

    private void enqueueNotification(String eventId, String email, String subject, String message) {
        outboxService.enqueue(
                "event",
                eventId,
                "notification.email.requested",
                Map.of(
                        "eventId", eventId,
                        "to", email,
                        "subject", subject,
                        "message", message));
    }
}
