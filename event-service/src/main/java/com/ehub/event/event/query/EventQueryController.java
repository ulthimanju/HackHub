package com.ehub.event.event.query;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ehub.event.dto.EventResponse;
import com.ehub.event.dto.EventStatsResponse;
import com.ehub.event.dto.LifecycleResponse;
import com.ehub.event.facade.EventFacade;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventQueryController {

    private final EventFacade eventFacade;

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private String getCurrentUserRole() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return "ANONYMOUS";
        }
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
}