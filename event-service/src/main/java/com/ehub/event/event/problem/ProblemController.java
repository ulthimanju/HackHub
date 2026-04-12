package com.ehub.event.event.problem;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ehub.event.facade.EventFacade;
import com.ehub.event.util.MessageKeys;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class ProblemController {

    private final EventFacade eventFacade;

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
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
}
