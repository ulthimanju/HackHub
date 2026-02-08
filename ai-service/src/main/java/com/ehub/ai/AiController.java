package com.ehub.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/evaluate/{teamId}")
    public ResponseEntity<String> evaluateTeam(@PathVariable String teamId) {
        aiService.evaluateTeam(teamId);
        return ResponseEntity.ok("Evaluation queued for team: " + teamId);
    }

    @PostMapping("/evaluate-event/{eventId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> evaluateEvent(@PathVariable String eventId) {
        try {
            aiService.queueEventEvaluation(eventId);
            return ResponseEntity.ok("Evaluation queued for event: " + eventId);
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }
}
