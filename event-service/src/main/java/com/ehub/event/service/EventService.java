package com.ehub.event.service;

import com.ehub.event.client.NotificationClient;
import com.ehub.event.dto.*;
import com.ehub.event.entity.Event;
import com.ehub.event.entity.ProblemStatement;
import com.ehub.event.entity.Registration;
import com.ehub.event.entity.Team;
import com.ehub.event.repository.EventRepository;
import com.ehub.event.repository.ProblemStatementRepository;
import com.ehub.event.repository.RegistrationRepository;
import com.ehub.event.util.MessageKeys;
import com.ehub.event.enums.RegistrationStatus;
import com.ehub.event.enums.EventStatus;
import com.ehub.event.util.ShortCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final ProblemStatementRepository problemRepository;
    private final RegistrationRepository registrationRepository;
    private final NotificationClient notificationClient;
    private final RedisTemplate<String, Object> redisTemplate;

    public List<EventResponse> getEventsByOrganizer(String organizerId) {
        return eventRepository.findByOrganizerId(organizerId).stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getEventsByParticipant(String userId) {
        List<String> eventIds = registrationRepository.findByUserId(userId).stream()
                .map(Registration::getEventId)
                .collect(Collectors.toList());
        
        return eventRepository.findAllById(eventIds).stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    public EventResponse getEventById(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        return mapToEventResponse(event);
    }

    public EventResponse getEventByShortCode(String shortCode) {
        Event event = eventRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        return mapToEventResponse(event);
    }

    private EventResponse mapToEventResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .shortCode(event.getShortCode())
                .name(event.getName())
                .description(event.getDescription())
                .theme(event.getTheme())
                .contactEmail(event.getContactEmail())
                .prizes(event.getPrizes())
                .rules(event.getRules())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .registrationStartDate(event.getRegistrationStartDate())
                .registrationEndDate(event.getRegistrationEndDate())
                .judging(Boolean.TRUE.equals(event.getJudging()))
                .resultsDate(event.getResultsDate())
                .venue(event.getVenue())
                .isVirtual(event.isVirtual())
                .location(event.getLocation())
                .maxParticipants(event.getMaxParticipants())
                .teamSize(event.getTeamSize())
                .status(event.getStatus() != null ? event.getStatus() : event.calculateCurrentStatus())
                .organizerId(event.getOrganizerId())
                .problemStatements(event.getProblemStatements().stream()
                        .map(this::mapToProblemStatementResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private EventResponse.ProblemStatementResponse mapToProblemStatementResponse(com.ehub.event.entity.ProblemStatement ps) {
        return EventResponse.ProblemStatementResponse.builder()
                .id(ps.getId())
                .statementId(ps.getStatementId())
                .statement(ps.getStatement())
                .build();
    }

    public String createEvent(EventRequest request, String currentUserId) {
        String id = UUID.randomUUID().toString();
        
        Event event = Event.builder()
                .id(id)
                .shortCode(shortCode)
                .name(request.getName())
                .description(request.getDescription())
                .theme(request.getTheme())
                .contactEmail(request.getContactEmail())
                .prizes(request.getPrizes())
                .rules(request.getRules())
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
        
        event.setStatus(event.calculateCurrentStatus());
        eventRepository.save(event);
        return id;
    }

    @Transactional
    public void updateEvent(String id, EventRequest request, String requesterId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        if (!event.getOrganizerId().equals(requesterId)) {
            throw new RuntimeException("Unauthorized: Only the event creator can manage this mission.");
        }

        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setTheme(request.getTheme());
        event.setContactEmail(request.getContactEmail());
        event.setPrizes(request.getPrizes());
        event.setRules(request.getRules());
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
        event.setStatus(event.calculateCurrentStatus());

        eventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(String id, String requesterId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        
        if (!event.getOrganizerId().equals(requesterId)) {
            throw new RuntimeException("Unauthorized: Only the event creator can delete this mission.");
        }
        
        eventRepository.deleteById(id);
    }

    @Transactional
    public void finalizeResults(String id, String requesterId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        
        if (!event.getOrganizerId().equals(requesterId)) {
            throw new RuntimeException("Unauthorized: Only the event creator can finalize results.");
        }

        event.setJudging(false);
        event.setStatus(event.calculateCurrentStatus());
        eventRepository.save(event);

        // Broadcast global update
        Map<String, Object> payload = new HashMap<>();
        payload.put("eventId", id);
        payload.put("eventName", event.getName());
        payload.put("status", "RESULTS_ANNOUNCED");
        payload.put("message", "Judging complete! Results for " + event.getName() + " are now live.");
        redisTemplate.convertAndSend("ehub:broadcast:global-alerts", payload);
    }

    @Transactional
    public void addProblemStatements(String eventId, List<ProblemStatementRequest> requests, String requesterId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        
        if (!event.getOrganizerId().equals(requesterId)) {
            throw new RuntimeException("Unauthorized: Only the event creator can add challenges.");
        }

        int currentCount = event.getProblemStatements().size();
        
        for (int i = 0; i < requests.size(); i++) {
            String id = UUID.randomUUID().toString();
            String autoStatementId = String.format("PS%03d", currentCount + i + 1);
            
            ProblemStatement problem = ProblemStatement.builder()
                    .id(id)
                    .statementId(autoStatementId)
                    .statement(requests.get(i).getStatement())
                    .event(event)
                    .build();
            
            problemRepository.save(problem);
        }
    }

    @Transactional
    public void addProblemStatement(String eventId, ProblemStatementRequest request, String requesterId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        
        if (!event.getOrganizerId().equals(requesterId)) {
            throw new RuntimeException("Unauthorized: Only the event creator can add challenges.");
        }

        String id = UUID.randomUUID().toString();
        String autoStatementId = String.format("PS%03d", event.getProblemStatements().size() + 1);

        ProblemStatement problem = ProblemStatement.builder()
                .id(id)
                .statementId(autoStatementId)
                .statement(request.getStatement())
                .event(event)
                .build();
        
        problemRepository.save(problem);
    }

    @Transactional
    public void updateProblemStatement(String id, ProblemStatementRequest request, String requesterId) {
        ProblemStatement problem = problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem statement not found"));
        
        if (!problem.getEvent().getOrganizerId().equals(requesterId)) {
            throw new RuntimeException("Unauthorized: Only the event creator can update challenges.");
        }

        problem.setStatement(request.getStatement());
        problemRepository.save(problem);
    }

    @Transactional
    public void deleteProblemStatement(String id, String requesterId) {
        ProblemStatement problem = problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem statement not found"));
        
        if (!problem.getEvent().getOrganizerId().equals(requesterId)) {
            throw new RuntimeException("Unauthorized: Only the event creator can delete challenges.");
        }

        problemRepository.deleteById(id);
    }

    @Transactional
    public void registerForEvent(String eventId, RegistrationRequest request, String currentUserId) {
        // Enforce that the registration is for the authenticated user
        if (!currentUserId.equals(request.getUserId())) {
            throw new RuntimeException("Unauthorized: Cannot register on behalf of another user.");
        }

        if (registrationRepository.existsByEventIdAndUserId(eventId, currentUserId)) {
            throw new RuntimeException(MessageKeys.ALREADY_REGISTERED.getMessage());
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        // Constraint: Check registration deadline
        if (event.getRegistrationEndDate() != null && LocalDateTime.now().isAfter(event.getRegistrationEndDate())) {
            throw new RuntimeException("Registration for this event has already closed.");
        }

        // Constraint: Check max participants capacity
        if (event.getMaxParticipants() != null) {
            long approvedCount = registrationRepository.findByEventId(eventId).stream()
                    .filter(reg -> reg.getStatus() == RegistrationStatus.APPROVED)
                    .count();
            if (approvedCount >= event.getMaxParticipants()) {
                throw new RuntimeException("Event capacity reached. No more participants can be approved.");
            }
        }

        String id = UUID.randomUUID().toString();
        
        Registration registration = Registration.builder()
                .id(id)
                .eventId(eventId)
                .userId(currentUserId)
                .username(request.getUsername())
                .userEmail(request.getUserEmail())
                .status(RegistrationStatus.PENDING)
                .registrationTime(LocalDateTime.now())
                .build();

        registrationRepository.save(registration);

        // Send Notification to User about pending request
        try {
            String subject = "Registration Request Received: " + event.getName();
            String message = "Your registration request for " + event.getName() + " is pending approval from the organizer.";
            notificationClient.sendEmail(request.getUserEmail(), subject, message);
        } catch (Exception e) {
            // Log error but don't fail registration
            System.err.println("Failed to send registration notification: " + e.getMessage());
        }
    }

    public List<RegistrationResponse> getEventRegistrations(String eventId) {
        return registrationRepository.findByEventId(eventId).stream()
                .map(reg -> RegistrationResponse.builder()
                        .id(reg.getId())
                        .eventId(reg.getEventId())
                        .userId(reg.getUserId())
                        .username(reg.getUsername())
                        .userEmail(reg.getUserEmail())
                        .status(reg.getStatus())
                        .registrationTime(reg.getRegistrationTime())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelRegistration(String registrationId, String currentUserId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException(MessageKeys.REGISTRATION_NOT_FOUND.getMessage()));
        
        if (!registration.getUserId().equals(currentUserId)) {
             throw new RuntimeException("Unauthorized: Only the participant can cancel their registration.");
        }

        registrationRepository.delete(registration);
    }

    @Transactional
    public void updateRegistrationStatus(String registrationId, RegistrationStatus status, String requesterId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException(MessageKeys.REGISTRATION_NOT_FOUND.getMessage()));
        
        Event event = eventRepository.findById(registration.getEventId())
                .orElseThrow(() -> new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        if (!event.getOrganizerId().equals(requesterId)) {
            throw new RuntimeException("Unauthorized: Only the event creator can manage registrations.");
        }

        registration.setStatus(status);
        registrationRepository.save(registration);

        // Broadcast to specific user via WebSocket bridge
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "REGISTRATION_UPDATE");
        payload.put("eventId", event.getId());
        payload.put("eventName", event.getName());
        payload.put("status", status.name());
        payload.put("message", "Your registration for " + event.getName() + " has been " + status.name());
        redisTemplate.convertAndSend("ehub:broadcast:user-" + registration.getUserId(), payload);

        // Send Notification to User
        try {
            String subject = "Registration " + status.name() + " for " + event.getName();
            String message = status == RegistrationStatus.APPROVED 
                ? "Congratulations! Your registration for " + event.getName() + " has been APPROVED."
                : "We regret to inform you that your registration for " + event.getName() + " has been REJECTED.";
            
            notificationClient.sendEmail(registration.getUserEmail(), subject, message);
        } catch (Exception e) {
            System.err.println("Failed to send status update notification: " + e.getMessage());
        }
    }
}
