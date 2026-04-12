package com.ehub.event.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
import com.ehub.event.util.MessageKeys;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventFacade eventFacade;

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private String getCurrentUserRole() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated())
            return "ANONYMOUS";
        return auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .findFirst()
                .orElse("ANONYMOUS");
    }

    @GetMapping("/organizer")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Page<EventResponse>> getMyEventsAsOrganizer(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size) {
        return ResponseEntity.ok(eventFacade.getEventsByOrganizer(getCurrentUserId(), PageRequest.of(page, size)));
    }

    @GetMapping("/my-registrations")
    public ResponseEntity<Page<EventResponse>> getMyEventsAsParticipant(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size) {
        return ResponseEntity.ok(eventFacade.getEventsByParticipant(getCurrentUserId(), PageRequest.of(page, size)));
    }

    @GetMapping("/my-registrations/status")
    public ResponseEntity<List<RegistrationResponse>> getMyRegistrationStatuses() {
        return ResponseEntity.ok(eventFacade.getMyRegistrations(getCurrentUserId()));
    }

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<List<EventResponse>> getEventsByOrganizer(@PathVariable String organizerId) {
        return ResponseEntity.ok(eventFacade.getEventsByOrganizer(organizerId));
    }

    @GetMapping("/participant/{userId}")
    public ResponseEntity<List<EventResponse>> getEventsByParticipant(@PathVariable String userId) {
        return ResponseEntity.ok(eventFacade.getEventsByParticipant(userId));
    }

    @GetMapping
    public ResponseEntity<Page<EventResponse>> getAllEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size) {
        return ResponseEntity.ok(eventFacade.getAllEvents(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}/stats")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<EventStatsResponse> getEventStats(@PathVariable String id) {
        return ResponseEntity.ok(eventFacade.getEventStats(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable String id) {
        return ResponseEntity.ok(eventFacade.getEventById(id));
    }

    @GetMapping("/{id}/lifecycle")
    public ResponseEntity<?> getEventLifecycle(
            @PathVariable String id,
            @RequestHeader(value = "If-None-Match", required = false) String ifNoneMatch) {
        String role = getCurrentUserRole();
        Map.Entry<String, LifecycleResponse> result = eventFacade.getEventLifecycleData(id, role);
        String etag = "\"" + result.getKey() + "\"";
        if (etag.equals(ifNoneMatch)) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).build();
        }
        return ResponseEntity.ok()
                .header("ETag", etag)
                .header("Cache-Control", "no-cache")
                .body(result.getValue());
    }

    @GetMapping("/code/{shortCode}")
    public ResponseEntity<EventResponse> getEventByShortCode(@PathVariable String shortCode) {
        return ResponseEntity.ok(eventFacade.getEventByShortCode(shortCode));
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> createEvent(@Valid @RequestBody EventRequest request) {
        String eventId = eventFacade.createEvent(request, getCurrentUserId());
        return ResponseEntity.ok(eventId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> updateEvent(
            @PathVariable String id,
            @Valid @RequestBody EventRequest request) {
        eventFacade.updateEvent(id, request, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.EVENT_UPDATED.getMessage());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> deleteEvent(@PathVariable String id) {
        eventFacade.deleteEvent(id, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.EVENT_DELETED.getMessage());
    }

    @PostMapping("/{eventId}/problemstatements/bulk")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> addProblemStatements(
            @PathVariable String eventId,
            @Valid @RequestBody List<ProblemStatementRequest> requests) {
        eventFacade.addProblemStatements(eventId, requests, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.PROBLEM_ADDED_SUCCESS.getMessage());
    }

    @PostMapping("/{eventId}/problemstatements")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> addProblemStatement(
            @PathVariable String eventId,
            @Valid @RequestBody ProblemStatementRequest request) {
        eventFacade.addProblemStatement(eventId, request, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.PROBLEM_ADDED_SUCCESS.getMessage());
    }

    @PutMapping("/problemstatements/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> updateProblemStatement(
            @PathVariable String id,
            @Valid @RequestBody ProblemStatementRequest request) {
        eventFacade.updateProblemStatement(id, request, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.PROBLEM_UPDATED.getMessage());
    }

    @DeleteMapping("/problemstatements/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> deleteProblemStatement(@PathVariable String id) {
        eventFacade.deleteProblemStatement(id, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.PROBLEM_DELETED.getMessage());
    }

    @PatchMapping("/{id}/advance-status")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> advanceEventStatus(@PathVariable String id) {
        com.ehub.event.enums.EventStatus newStatus = eventFacade.advanceEventStatus(id, getCurrentUserId());
        return ResponseEntity.ok(newStatus.name());
    }

    @PatchMapping("/{id}/judging")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> toggleJudging(@PathVariable String id) {
        boolean judgingEnabled = eventFacade.toggleJudging(id, getCurrentUserId());
        return ResponseEntity.ok(judgingEnabled ? "JUDGING_ENABLED" : "JUDGING_DISABLED");
    }

    @PatchMapping("/{id}/finalize")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> finalizeResults(@PathVariable String id) {
        // Delegates to advanceEventStatus — event must be in JUDGING state
        EventStatus newStatus = eventFacade.advanceEventStatus(id, getCurrentUserId());
        return ResponseEntity.ok(newStatus.name());
    }

    @PostMapping("/{eventId}/register")
    public ResponseEntity<String> registerForEvent(
            @PathVariable String eventId,
            @Valid @RequestBody RegistrationRequest request) {
        // userId in request should match current user or be populated from current user
        eventFacade.registerForEvent(eventId, request, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.REGISTRATION_SUCCESS.getMessage());
    }

    @GetMapping("/{eventId}/registrations")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Page<RegistrationResponse>> getEventRegistrations(
            @PathVariable String eventId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size) {
        return ResponseEntity.ok(eventFacade.getEventRegistrations(eventId, PageRequest.of(page, size)));
    }

    @DeleteMapping("/registrations/{registrationId}")
    public ResponseEntity<String> cancelRegistration(@PathVariable String registrationId) {
        eventFacade.cancelRegistration(registrationId, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.REGISTRATION_CANCELLED.getMessage());
    }

    @PatchMapping("/registrations/{registrationId}/status")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> updateRegistrationStatus(
            @PathVariable String registrationId,
            @RequestParam RegistrationStatus status) {
        eventFacade.updateRegistrationStatus(registrationId, status, getCurrentUserId());
        String message = status == RegistrationStatus.APPROVED
                ? MessageKeys.REGISTRATION_APPROVED.getMessage()
                : MessageKeys.REGISTRATION_REJECTED.getMessage();
        return ResponseEntity.ok(message);
    }
}
