package com.ehub.ai;

import com.ehub.ai.util.MessageKeys;
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
        return ResponseEntity.ok(String.format(MessageKeys.EVALUATION_QUEUED_TEAM.getMessage(), teamId));
    }

    @PostMapping("/evaluate-event/{eventId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> evaluateEvent(@PathVariable String eventId) {
        try {
            aiService.queueEventEvaluation(eventId);
            return ResponseEntity.ok(String.format(MessageKeys.EVALUATION_QUEUED_EVENT.getMessage(), eventId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }
}
