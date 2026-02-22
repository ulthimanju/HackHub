package com.ehub.event.controller;

import com.ehub.event.service.ReferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class ReferenceController {

    private final ReferenceService referenceService;

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/{eventId}/references")
    public ResponseEntity<Map<String, String>> getReferences(@PathVariable String eventId) {
        String contentMd = referenceService.getReferences(eventId);
        return ResponseEntity.ok(Map.of("contentMd", contentMd));
    }

    @PutMapping("/{eventId}/references")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Map<String, String>> upsertReferences(
            @PathVariable String eventId,
            @RequestBody Map<String, String> body) {
        String contentMd = body.getOrDefault("contentMd", "");
        referenceService.upsertReferences(eventId, contentMd, getCurrentUserId());
        return ResponseEntity.ok(Map.of("contentMd", contentMd));
    }
}
