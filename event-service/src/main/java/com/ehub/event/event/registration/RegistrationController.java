package com.ehub.event.event.registration;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ehub.event.facade.EventFacade;
import com.ehub.event.shared.enums.RegistrationStatus;
import com.ehub.event.util.MessageKeys;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class RegistrationController {

    private final EventFacade eventFacade;

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/my-registrations/status")
    public ResponseEntity<List<RegistrationResponse>> getMyRegistrationStatuses() {
        return ResponseEntity.ok(eventFacade.getMyRegistrations(getCurrentUserId()));
    }

    @PostMapping("/{eventId}/register")
    public ResponseEntity<String> registerForEvent(
            @PathVariable String eventId,
            @Valid @RequestBody RegistrationRequest request) {
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
