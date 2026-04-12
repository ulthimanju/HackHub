package com.ehub.event.event.lifecycle;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ehub.event.dto.EventRequest;
import com.ehub.event.facade.EventFacade;
import com.ehub.event.shared.enums.EventStatus;
import com.ehub.event.util.MessageKeys;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventLifecycleController {

    private final EventFacade eventFacade;

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> createEvent(@Valid @RequestBody EventRequest request) {
        String eventId = eventFacade.createEvent(request, getCurrentUserId());
        return ResponseEntity.ok(eventId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> updateEvent(@PathVariable String id, @Valid @RequestBody EventRequest request) {
        eventFacade.updateEvent(id, request, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.EVENT_UPDATED.getMessage());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> deleteEvent(@PathVariable String id) {
        eventFacade.deleteEvent(id, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.EVENT_DELETED.getMessage());
    }

    @PatchMapping("/{id}/advance-status")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> advanceEventStatus(@PathVariable String id) {
        EventStatus newStatus = eventFacade.advanceEventStatus(id, getCurrentUserId());
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
        EventStatus newStatus = eventFacade.advanceEventStatus(id, getCurrentUserId());
        return ResponseEntity.ok(newStatus.name());
    }
}