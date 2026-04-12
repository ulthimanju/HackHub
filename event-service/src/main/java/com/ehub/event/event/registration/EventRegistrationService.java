package com.ehub.event.event.registration;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ehub.event.event.registration.RegistrationRequest;
import com.ehub.event.shared.entity.Event;
import com.ehub.event.shared.entity.Registration;
import com.ehub.event.shared.entity.TeamMember;
import com.ehub.event.shared.enums.RegistrationStatus;
import com.ehub.event.shared.enums.TeamRole;
import com.ehub.event.event.registration.EventRegistrationException;
import com.ehub.event.exception.ResourceNotFoundException;
import com.ehub.event.shared.port.EventClock;
import com.ehub.event.shared.port.NotificationPort;
import com.ehub.event.shared.repository.EventRepository;
import com.ehub.event.shared.repository.RegistrationRepository;
import com.ehub.event.shared.repository.TeamMemberRepository;
import com.ehub.event.shared.repository.TeamRepository;
import com.ehub.event.util.MessageKeys;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class EventRegistrationService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final NotificationPort notificationPort;
    private final RedisTemplate<String, Object> redisTemplate;
    private final EventClock eventClock;

    @Transactional
    public void registerForEvent(String eventId, RegistrationRequest request, String currentUserId) {
        if (registrationRepository.existsByEventIdAndUserId(eventId, currentUserId)) {
            throw new EventRegistrationException(MessageKeys.ALREADY_REGISTERED.getMessage());
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        if (event.getRegistrationEndDate() != null && eventClock.now().isAfter(event.getRegistrationEndDate())) {
            throw new EventRegistrationException(MessageKeys.REGISTRATION_CLOSED.getMessage());
        }

        if (event.getMaxParticipants() != null) {
            long approvedCount = registrationRepository.findByEventId(eventId).stream()
                    .filter(reg -> reg.getStatus() == RegistrationStatus.APPROVED)
                    .count();
            if (approvedCount >= event.getMaxParticipants()) {
                throw new EventRegistrationException(MessageKeys.EVENT_CAPACITY_REACHED.getMessage());
            }
        }

        Registration registration = Registration.builder()
                .id(UUID.randomUUID().toString())
                .eventId(eventId)
                .userId(currentUserId)
                .username(request.getUsername())
                .userEmail(request.getUserEmail())
                .status(RegistrationStatus.PENDING)
                .registrationTime(eventClock.now())
                .build();

        registrationRepository.save(registration);

        try {
            String subject = "Registration Request Received: " + event.getName();
            String message = "Your registration request for " + event.getName()
                    + " is pending approval from the organizer.";
            notificationPort.sendEmail(request.getUserEmail(), subject, message);
        } catch (Exception e) {
            log.warn("Failed to send registration notification to {}", request.getUserEmail(), e);
        }
    }

    @Transactional
    public void cancelRegistration(String registrationId, String currentUserId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.REGISTRATION_NOT_FOUND.getMessage()));

        if (!registration.getUserId().equals(currentUserId)) {
            throw new AccessDeniedException(MessageKeys.UNAUTHORIZED_CANCEL_REGISTRATION.getMessage());
        }

        registrationRepository.delete(registration);
    }

    @Transactional
    public void updateRegistrationStatus(String registrationId, RegistrationStatus status, String requesterId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.REGISTRATION_NOT_FOUND.getMessage()));

        Event event = eventRepository.findById(registration.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        if (!event.getOrganizerId().equals(requesterId)) {
            throw new AccessDeniedException(MessageKeys.UNAUTHORIZED_MANAGE_REGISTRATIONS.getMessage());
        }

        registration.setStatus(status);
        registrationRepository.save(registration);

        if (status == RegistrationStatus.REJECTED) {
            Optional<TeamMember> membership = teamMemberRepository
                    .findByTeamEventIdAndUserId(registration.getEventId(), registration.getUserId());
            membership.ifPresent(m -> {
                if (m.getRole() == TeamRole.LEADER) {
                    teamRepository.deleteById(m.getTeam().getId());
                } else {
                    teamMemberRepository.delete(m);
                }
            });
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "REGISTRATION_UPDATE");
        payload.put("eventId", event.getId());
        payload.put("eventName", event.getName());
        payload.put("status", status.name());
        payload.put("message", "Your registration for " + event.getName() + " has been " + status.name());
        redisTemplate.convertAndSend("ehub:broadcast:user-" + registration.getUserId(), payload);

        try {
            String subject = "Registration " + status.name() + " for " + event.getName();
            String message = status == RegistrationStatus.APPROVED
                    ? "Congratulations! Your registration for " + event.getName() + " has been APPROVED."
                    : "We regret to inform you that your registration for " + event.getName() + " has been REJECTED.";

            notificationPort.sendEmail(registration.getUserEmail(), subject, message);
        } catch (Exception e) {
            log.warn("Failed to send status update notification to {}", registration.getUserEmail(), e);
        }
    }
}
