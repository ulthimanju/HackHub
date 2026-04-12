package com.ehub.event.service;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ehub.event.dto.EventRequest;
import com.ehub.event.dto.EventResponse;
import com.ehub.event.dto.EventStatsResponse;
import com.ehub.event.dto.LifecycleResponse;
import com.ehub.event.dto.ProblemStatementRequest;
import com.ehub.event.dto.RegistrationRequest;
import com.ehub.event.dto.RegistrationResponse;
import com.ehub.event.enums.EventStatus;
import com.ehub.event.enums.RegistrationStatus;
import com.ehub.event.facade.EventFacade;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventFacade eventFacade;

    public List<EventResponse> getEventsByOrganizer(String organizerId) {
        return eventFacade.getEventsByOrganizer(organizerId);
    }

    public EventStatsResponse getEventStats(String eventId) {
        return eventFacade.getEventStats(eventId);
    }

    public List<EventResponse> getEventsByParticipant(String userId) {
        return eventFacade.getEventsByParticipant(userId);
    }

    public List<EventResponse> getAllEvents() {
        return eventFacade.getAllEvents();
    }

    public Page<EventResponse> getAllEvents(Pageable pageable) {
        return eventFacade.getAllEvents(pageable);
    }

    public Page<EventResponse> getEventsByOrganizer(String organizerId, Pageable pageable) {
        return eventFacade.getEventsByOrganizer(organizerId, pageable);
    }

    public Page<EventResponse> getEventsByParticipant(String userId, Pageable pageable) {
        return eventFacade.getEventsByParticipant(userId, pageable);
    }

    public Page<RegistrationResponse> getEventRegistrations(String eventId, Pageable pageable) {
        return eventFacade.getEventRegistrations(eventId, pageable);
    }

    public EventResponse getEventById(String id) {
        return eventFacade.getEventById(id);
    }

    public Map.Entry<String, LifecycleResponse> getEventLifecycleData(String id, String role) {
        return eventFacade.getEventLifecycleData(id, role);
    }

    public EventResponse getEventByShortCode(String shortCode) {
        return eventFacade.getEventByShortCode(shortCode);
    }

    public String createEvent(EventRequest request, String currentUserId) {
        return eventFacade.createEvent(request, currentUserId);
    }

    public void updateEvent(String id, EventRequest request, String requesterId) {
        eventFacade.updateEvent(id, request, requesterId);
    }

    public boolean toggleJudging(String id, String requesterId) {
        return eventFacade.toggleJudging(id, requesterId);
    }

    public void deleteEvent(String id, String requesterId) {
        eventFacade.deleteEvent(id, requesterId);
    }

    public EventStatus advanceEventStatus(String id, String requesterId) {
        return eventFacade.advanceEventStatus(id, requesterId);
    }

    public void addProblemStatements(String eventId, List<ProblemStatementRequest> requests, String requesterId) {
        eventFacade.addProblemStatements(eventId, requests, requesterId);
    }

    public void addProblemStatement(String eventId, ProblemStatementRequest request, String requesterId) {
        eventFacade.addProblemStatement(eventId, request, requesterId);
    }

    public void updateProblemStatement(String id, ProblemStatementRequest request, String requesterId) {
        eventFacade.updateProblemStatement(id, request, requesterId);
    }

    public void deleteProblemStatement(String id, String requesterId) {
        eventFacade.deleteProblemStatement(id, requesterId);
    }

    public void registerForEvent(String eventId, RegistrationRequest request, String currentUserId) {
        eventFacade.registerForEvent(eventId, request, currentUserId);
    }

    public List<RegistrationResponse> getMyRegistrations(String userId) {
        return eventFacade.getMyRegistrations(userId);
    }

    public List<RegistrationResponse> getEventRegistrations(String eventId) {
        return eventFacade.getEventRegistrations(eventId);
    }

    public void cancelRegistration(String registrationId, String currentUserId) {
        eventFacade.cancelRegistration(registrationId, currentUserId);
    }

    public void updateRegistrationStatus(String registrationId, RegistrationStatus status, String requesterId) {
        eventFacade.updateRegistrationStatus(registrationId, status, requesterId);
    }
}
