package com.ehub.ai.controller;

import com.ehub.ai.service.EvaluationWorker;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller exposing AI evaluation operations.
 *
 * All endpoints require the X-Internal-Secret header (enforced by HeaderAuthenticationFilter).
 */
@RestController
@RequestMapping("/ai")
public class AiController {

    private final EvaluationWorker worker;

    public AiController(EvaluationWorker worker) {
        this.worker = worker;
    }

    /**
     * Queues evaluation jobs for all eligible teams (those with a repoUrl) in an event.
     * Returns the count of teams queued.
     */
    @PostMapping("/evaluate-event/{eventId}")
    public ResponseEntity<Map<String, Object>> evaluateEvent(@PathVariable String eventId) {
        int queued = worker.queueEvent(eventId);
        return ResponseEntity.accepted().body(Map.of(
                "eventId", eventId,
                "teamsQueued", queued,
                "message", "Evaluation jobs queued. Use /ai/job/{teamId}/status to track progress."
        ));
    }

    /**
     * Queues a single team for evaluation immediately.
     */
    @PostMapping("/evaluate-team/{teamId}")
    public ResponseEntity<Map<String, Object>> evaluateTeam(@PathVariable String teamId) {
        worker.queueTeam(teamId);
        return ResponseEntity.accepted().body(Map.of(
                "teamId", teamId,
                "message", "Team evaluation queued."
        ));
    }

    /**
     * Returns the current evaluation status for a team.
     * Status values: NOT_FOUND, QUEUED, CLONING, ANALYZING, COMPLETED, FAILED
     */
    @GetMapping("/job/{teamId}/status")
    public ResponseEntity<Map<Object, Object>> getJobStatus(@PathVariable String teamId) {
        return ResponseEntity.ok(worker.getJobStatus(teamId));
    }
}
