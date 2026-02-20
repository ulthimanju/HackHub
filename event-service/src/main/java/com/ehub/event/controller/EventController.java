package com.ehub.event.controller;

import com.ehub.event.dto.*;
import com.ehub.event.service.EventService;
import com.ehub.event.util.MessageKeys;
import com.ehub.event.enums.RegistrationStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/organizer")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<List<EventResponse>> getMyEventsAsOrganizer() {
        return ResponseEntity.ok(eventService.getEventsByOrganizer(getCurrentUserId()));
    }

    @GetMapping("/my-registrations")
    public ResponseEntity<List<EventResponse>> getMyEventsAsParticipant() {
        return ResponseEntity.ok(eventService.getEventsByParticipant(getCurrentUserId()));
    }

    @GetMapping("/my-registrations/status")
    public ResponseEntity<List<RegistrationResponse>> getMyRegistrationStatuses() {
        return ResponseEntity.ok(eventService.getMyRegistrations(getCurrentUserId()));
    }

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<List<EventResponse>> getEventsByOrganizer(@PathVariable String organizerId) {
        return ResponseEntity.ok(eventService.getEventsByOrganizer(organizerId));
    }

    @GetMapping("/participant/{userId}")
    public ResponseEntity<List<EventResponse>> getEventsByParticipant(@PathVariable String userId) {
        return ResponseEntity.ok(eventService.getEventsByParticipant(userId));
    }

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}/stats")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<EventStatsResponse> getEventStats(@PathVariable String id) {
        return ResponseEntity.ok(eventService.getEventStats(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable String id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @GetMapping("/code/{shortCode}")
    public ResponseEntity<EventResponse> getEventByShortCode(@PathVariable String shortCode) {
        return ResponseEntity.ok(eventService.getEventByShortCode(shortCode));
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> createEvent(@Valid @RequestBody EventRequest request) {
        String eventId = eventService.createEvent(request, getCurrentUserId());
        return ResponseEntity.ok(eventId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> updateEvent(
            @PathVariable String id,
            @Valid @RequestBody EventRequest request) {
        eventService.updateEvent(id, request, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.EVENT_UPDATED.getMessage());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.EVENT_DELETED.getMessage());
    }

    @PostMapping("/{eventId}/problemstatements/bulk")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> addProblemStatements(
            @PathVariable String eventId,
            @Valid @RequestBody List<ProblemStatementRequest> requests) {
        eventService.addProblemStatements(eventId, requests, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.PROBLEM_ADDED_SUCCESS.getMessage());
    }

    @PostMapping("/{eventId}/problemstatements")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> addProblemStatement(
            @PathVariable String eventId,
            @Valid @RequestBody ProblemStatementRequest request) {
        eventService.addProblemStatement(eventId, request, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.PROBLEM_ADDED_SUCCESS.getMessage());
    }

    @PutMapping("/problemstatements/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> updateProblemStatement(
            @PathVariable String id,
            @Valid @RequestBody ProblemStatementRequest request) {
        eventService.updateProblemStatement(id, request, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.PROBLEM_UPDATED.getMessage());
    }

    @DeleteMapping("/problemstatements/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> deleteProblemStatement(@PathVariable String id) {
        eventService.deleteProblemStatement(id, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.PROBLEM_DELETED.getMessage());
    }

    @PatchMapping("/{id}/advance-status")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> advanceEventStatus(@PathVariable String id) {
        com.ehub.event.enums.EventStatus newStatus = eventService.advanceEventStatus(id, getCurrentUserId());
        return ResponseEntity.ok(newStatus.name());
    }

    @PatchMapping("/{id}/finalize-results")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> finalizeResults(@PathVariable String id) {
        eventService.finalizeResults(id, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.RESULTS_FINALIZED.getMessage());
    }

    @PostMapping("/{eventId}/register")
    public ResponseEntity<String> registerForEvent(
            @PathVariable String eventId,
            @Valid @RequestBody RegistrationRequest request) {
        // userId in request should match current user or be populated from current user
        eventService.registerForEvent(eventId, request, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.REGISTRATION_SUCCESS.getMessage());
    }

    @GetMapping("/{eventId}/registrations")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<List<RegistrationResponse>> getEventRegistrations(@PathVariable String eventId) {
        return ResponseEntity.ok(eventService.getEventRegistrations(eventId));
    }

    @DeleteMapping("/registrations/{registrationId}")
    public ResponseEntity<String> cancelRegistration(@PathVariable String registrationId) {
        eventService.cancelRegistration(registrationId, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.REGISTRATION_CANCELLED.getMessage());
    }

    @PatchMapping("/registrations/{registrationId}/status")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> updateRegistrationStatus(
            @PathVariable String registrationId,
            @RequestParam RegistrationStatus status) {
        eventService.updateRegistrationStatus(registrationId, status, getCurrentUserId());
        String message = status == RegistrationStatus.APPROVED 
            ? MessageKeys.REGISTRATION_APPROVED.getMessage() 
            : MessageKeys.REGISTRATION_REJECTED.getMessage();
        return ResponseEntity.ok(message);
    }
}
