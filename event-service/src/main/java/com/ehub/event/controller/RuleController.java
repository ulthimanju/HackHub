package com.ehub.event.controller;

import com.ehub.event.service.RuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class RuleController {

    private final RuleService ruleService;

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/{eventId}/rules")
    public ResponseEntity<Map<String, String>> getRules(@PathVariable String eventId) {
        String contentMd = ruleService.getRules(eventId);
        return ResponseEntity.ok(Map.of("contentMd", contentMd));
    }

    @PutMapping("/{eventId}/rules")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Map<String, String>> upsertRules(
            @PathVariable String eventId,
            @RequestBody Map<String, String> body) {
        String contentMd = body.getOrDefault("contentMd", "");
        ruleService.upsertRules(eventId, contentMd, getCurrentUserId());
        return ResponseEntity.ok(Map.of("contentMd", contentMd));
    }
}
