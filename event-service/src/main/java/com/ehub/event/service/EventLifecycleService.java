package com.ehub.event.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ehub.event.dto.EventRequest;
import com.ehub.event.shared.entity.Event;
import com.ehub.event.shared.entity.Registration;
import com.ehub.event.shared.enums.EventStatus;
import com.ehub.event.shared.enums.RegistrationStatus;
import com.ehub.event.shared.enums.TeamMemberStatus;
import com.ehub.event.exception.EventLifecycleException;
import com.ehub.event.exception.ResourceNotFoundException;
import com.ehub.event.shared.port.EventClock;
import com.ehub.event.shared.port.NotificationPort;
import com.ehub.event.shared.repository.EventRepository;
import com.ehub.event.shared.repository.RegistrationRepository;
import com.ehub.event.shared.repository.TeamMemberRepository;
import com.ehub.event.shared.repository.TeamRepository;
import com.ehub.event.util.MessageKeys;
import com.ehub.event.util.ShortCodeGenerator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class EventLifecycleService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final NotificationPort notificationPort;
    private final RedisTemplate<String, Object> redisTemplate;
    private final EventClock eventClock;

    public String createEvent(EventRequest request, String currentUserId) {
        validateEventDates(request);
        String id = UUID.randomUUID().toString();
        String shortCode = ShortCodeGenerator.generate(8);

        Event event = Event.builder()
                .id(id)
                .shortCode(shortCode)
                .name(request.getName())
                .description(request.getDescription())
                .theme(request.getTheme())
                .contactEmail(request.getContactEmail())
                .prizes(request.getPrizes())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .registrationStartDate(request.getRegistrationStartDate())
                .registrationEndDate(request.getRegistrationEndDate())
                .judging(request.isJudging())
                .resultsDate(request.getResultsDate())
                .venue(request.getVenue())
                .isVirtual(request.isVirtual())
                .location(request.getLocation())
                .maxParticipants(request.getMaxParticipants())
                .teamSize(request.getTeamSize())
                .organizerId(currentUserId)
                .build();

        event.setStatus(event.calculateCurrentStatus(eventClock.now()));
        eventRepository.save(event);
        return id;
    }

    @Transactional
    public void updateEvent(String id, EventRequest request, String requesterId) {
        validateEventDates(request);
        Event event = requireEventOwnership(id, requesterId);

        if (request.getTeamSize() != null && event.getTeamSize() != null
                && request.getTeamSize() < event.getTeamSize()) {
            List<com.ehub.event.shared.entity.Team> eventTeams = teamRepository.findByEventId(id);
            for (com.ehub.event.shared.entity.Team team : eventTeams) {
                long memberCount = teamMemberRepository.findByTeamId(team.getId()).stream()
                        .filter(m -> m.getStatus() == TeamMemberStatus.ACCEPTED)
                        .count();
                if (memberCount > request.getTeamSize()) {
                    throw new EventLifecycleException("Cannot reduce team size to " + request.getTeamSize()
                            + " - team \"" + team.getName() + "\" already has " + memberCount + " accepted members.");
                }
            }
        }

        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setTheme(request.getTheme());
        event.setContactEmail(request.getContactEmail());
        event.setPrizes(request.getPrizes());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setRegistrationStartDate(request.getRegistrationStartDate());
        event.setRegistrationEndDate(request.getRegistrationEndDate());
        event.setJudging(request.isJudging());
        event.setResultsDate(request.getResultsDate());
        event.setVenue(request.getVenue());
        event.setVirtual(request.isVirtual());
        event.setLocation(request.getLocation());
        event.setMaxParticipants(request.getMaxParticipants());
        event.setTeamSize(request.getTeamSize());
        event.setStatus(event.calculateCurrentStatus(eventClock.now()));
        eventRepository.save(event);
    }

    @Transactional
    public boolean toggleJudging(String id, String requesterId) {
        Event event = requireEventOwnership(id, requesterId);
        boolean newValue = !Boolean.TRUE.equals(event.getJudging());
        event.setJudging(newValue);
        event.setStatus(event.calculateCurrentStatus(eventClock.now()));
        eventRepository.save(event);
        return newValue;
    }

    @Transactional
    public void deleteEvent(String id, String requesterId) {
        requireEventOwnership(id, requesterId);
        eventRepository.deleteById(id);
    }

    @Transactional
    public EventStatus advanceEventStatus(String id, String requesterId) {
        Event event = requireEventOwnership(id, requesterId);

        LocalDateTime now = eventClock.now();
        EventStatus current = event.getStatus() != null ? event.getStatus() : EventStatus.UPCOMING;

        switch (current) {
            case UPCOMING -> {
                event.setRegistrationStartDate(now.minusSeconds(1));
                if (event.getRegistrationEndDate() == null || !now.isBefore(event.getRegistrationEndDate())) {
                    LocalDateTime anchor = event.getStartDate() != null && event.getStartDate().isAfter(now)
                            ? event.getStartDate()
                            : now.plusDays(7);
                    event.setRegistrationEndDate(anchor);
                }
            }
            case REGISTRATION_OPEN -> {
                event.setRegistrationEndDate(now.minusSeconds(1));
                event.setStartDate(now.minusSeconds(1));
                if (event.getEndDate() == null || !event.getEndDate().isAfter(now)) {
                    event.setEndDate(now.plusDays(2));
                }
            }
            case ONGOING -> {
                event.setEndDate(now.minusSeconds(1));
                event.setJudging(true);
                if (event.getResultsDate() == null || !event.getResultsDate().isAfter(now)) {
                    event.setResultsDate(now.plusDays(3));
                }
            }
            case JUDGING -> {
                event.setJudging(false);
                if (event.getResultsDate() == null || !event.getResultsDate().isAfter(now)) {
                    event.setResultsDate(now.plusDays(30));
                }
                event.setStatus(EventStatus.RESULTS_ANNOUNCED);
                eventRepository.save(event);
                notifyParticipantsResultsAnnounced(id, event);
                return event.getStatus();
            }
            case RESULTS_ANNOUNCED -> event.setResultsDate(now.minusSeconds(1));
            default -> throw new EventLifecycleException("Event cannot be advanced from status: " + current);
        }

        event.setStatus(event.calculateCurrentStatus(now));
        eventRepository.save(event);
        return event.getStatus();
    }

    private void notifyParticipantsResultsAnnounced(String eventId, Event event) {
        List<Registration> approved = registrationRepository.findByEventId(eventId).stream()
                .filter(r -> r.getStatus() == RegistrationStatus.APPROVED)
                .toList();

        for (Registration reg : approved) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "RESULTS_ANNOUNCED");
            payload.put("eventId", eventId);
            payload.put("eventName", event.getName());
            payload.put("status", "RESULTS_ANNOUNCED");
            payload.put("message", "Results for \"" + event.getName() + "\" are now live! Check the leaderboard.");
            redisTemplate.convertAndSend("ehub:broadcast:user-" + reg.getUserId(), payload);

            try {
                notificationPort.sendEmail(
                        reg.getUserEmail(),
                        "Results Announced: " + event.getName(),
                        "Hi " + reg.getUsername() + ",\n\nThe results for \"" + event.getName()
                                + "\" have been announced! Head to the platform to view the final leaderboard and your ranking.\n\nBest regards,\nEHub Team");
            } catch (Exception e) {
                log.warn("Failed to send results email to {}", reg.getUserEmail(), e);
            }
        }
    }

    private Event requireEventOwnership(String eventId, String requesterId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        if (!event.getOrganizerId().equals(requesterId)) {
            throw new AccessDeniedException(MessageKeys.UNAUTHORIZED_ORGANIZER.getMessage());
        }
        return event;
    }

    private void validateEventDates(EventRequest request) {
        if (request.getRegistrationEndDate() != null && request.getStartDate() != null
                && request.getRegistrationEndDate().isAfter(request.getStartDate())) {
            throw new EventLifecycleException(MessageKeys.REGISTRATION_END_BEFORE_START.getMessage());
        }
        if (request.getStartDate() != null && request.getEndDate() != null
                && !request.getStartDate().isBefore(request.getEndDate())) {
            throw new EventLifecycleException("Event start date must be before end date.");
        }
    }
}
