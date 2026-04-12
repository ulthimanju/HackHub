package com.ehub.event.facade;

import com.ehub.event.dto.*;
import com.ehub.event.shared.enums.EventStatus;
import com.ehub.event.shared.enums.RegistrationStatus;
import com.ehub.event.service.EventLifecycleService;
import com.ehub.event.service.EventQueryService;
import com.ehub.event.service.EventRegistrationService;
import com.ehub.event.service.ProblemStatementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EventFacade {

    private final EventQueryService queryService;
    private final EventLifecycleService lifecycleService;
    private final EventRegistrationService registrationService;
    private final ProblemStatementService problemStatementService;

    public List<EventResponse> getEventsByOrganizer(String organizerId) {
        return queryService.getEventsByOrganizer(organizerId);
    }

    public EventStatsResponse getEventStats(String eventId) {
        return queryService.getEventStats(eventId);
    }

    public List<EventResponse> getEventsByParticipant(String userId) {
        return queryService.getEventsByParticipant(userId);
    }

    public List<EventResponse> getAllEvents() {
        return queryService.getAllEvents();
    }

    public Page<EventResponse> getAllEvents(Pageable pageable) {
        return queryService.getAllEvents(pageable);
    }

    public Page<EventResponse> getEventsByOrganizer(String organizerId, Pageable pageable) {
        return queryService.getEventsByOrganizer(organizerId, pageable);
    }

    public Page<EventResponse> getEventsByParticipant(String userId, Pageable pageable) {
        return queryService.getEventsByParticipant(userId, pageable);
    }

    public Page<RegistrationResponse> getEventRegistrations(String eventId, Pageable pageable) {
        return queryService.getEventRegistrations(eventId, pageable);
    }

    public List<RegistrationResponse> getEventRegistrations(String eventId) {
        return queryService.getEventRegistrations(eventId);
    }

    public EventResponse getEventById(String id) {
        return queryService.getEventById(id);
    }

    public Map.Entry<String, LifecycleResponse> getEventLifecycleData(String id, String role) {
        return queryService.getEventLifecycleData(id, role);
    }

    public EventResponse getEventByShortCode(String shortCode) {
        return queryService.getEventByShortCode(shortCode);
    }

    public String createEvent(EventRequest request, String currentUserId) {
        return lifecycleService.createEvent(request, currentUserId);
    }

    public void updateEvent(String id, EventRequest request, String requesterId) {
        lifecycleService.updateEvent(id, request, requesterId);
    }

    public boolean toggleJudging(String id, String requesterId) {
        return lifecycleService.toggleJudging(id, requesterId);
    }

    public void deleteEvent(String id, String requesterId) {
        lifecycleService.deleteEvent(id, requesterId);
    }

    public EventStatus advanceEventStatus(String id, String requesterId) {
        return lifecycleService.advanceEventStatus(id, requesterId);
    }

    public void addProblemStatements(String eventId, List<ProblemStatementRequest> requests, String requesterId) {
        problemStatementService.addProblemStatements(eventId, requests, requesterId);
    }

    public void addProblemStatement(String eventId, ProblemStatementRequest request, String requesterId) {
        problemStatementService.addProblemStatement(eventId, request, requesterId);
    }

    public void updateProblemStatement(String id, ProblemStatementRequest request, String requesterId) {
        problemStatementService.updateProblemStatement(id, request, requesterId);
    }

    public void deleteProblemStatement(String id, String requesterId) {
        problemStatementService.deleteProblemStatement(id, requesterId);
    }

    public void registerForEvent(String eventId, RegistrationRequest request, String currentUserId) {
        registrationService.registerForEvent(eventId, request, currentUserId);
    }

    public List<RegistrationResponse> getMyRegistrations(String userId) {
        return queryService.getMyRegistrations(userId);
    }

    public void cancelRegistration(String registrationId, String currentUserId) {
        registrationService.cancelRegistration(registrationId, currentUserId);
    }

    public void updateRegistrationStatus(String registrationId, RegistrationStatus status, String requesterId) {
        registrationService.updateRegistrationStatus(registrationId, status, requesterId);
    }
}
