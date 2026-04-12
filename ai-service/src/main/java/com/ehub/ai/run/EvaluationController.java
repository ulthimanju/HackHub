package com.ehub.ai.run;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ehub.ai.queue.EvaluationRequestPublisher;
import com.ehub.ai.run.EvaluationWorker;

/**
 * REST controller exposing AI evaluation operations.
 *
 * All endpoints require the X-Internal-Secret header (enforced by
 * HeaderAuthenticationFilter).
 */
@RestController
@RequestMapping("/ai")
public class EvaluationController {

    private final EvaluationWorker worker;
    private final EvaluationRequestPublisher requestPublisher;

    public EvaluationController(EvaluationWorker worker, EvaluationRequestPublisher requestPublisher) {
        this.worker = worker;
        this.requestPublisher = requestPublisher;
    }

    /**
     * Queues evaluation jobs for all eligible teams (those with a repoUrl) in an
     * event.
     * Returns the count of teams queued.
     */
    @PostMapping("/evaluate-event/{eventId}")
    public ResponseEntity<Map<String, Object>> evaluateEvent(@PathVariable String eventId) {
        int queued = requestPublisher.isEnabled() ? 0 : worker.queueEvent(eventId);
        if (requestPublisher.isEnabled()) {
            requestPublisher.publishEvent(eventId);
        }
        return ResponseEntity.accepted().body(Map.of(
                "eventId", eventId,
                "teamsQueued", queued,
                "message", requestPublisher.isEnabled()
                        ? "Evaluation request published to Kafka. Use /ai/job/{teamId}/status to track progress."
                        : "Evaluation jobs queued. Use /ai/job/{teamId}/status to track progress."));
    }

    /**
     * Queues a single team for evaluation immediately.
     */
    @PostMapping("/evaluate-team/{teamId}")
    public ResponseEntity<Map<String, Object>> evaluateTeam(@PathVariable String teamId) {
        if (requestPublisher.isEnabled()) {
            requestPublisher.publishTeam(teamId);
        } else {
            worker.queueTeam(teamId);
        }
        return ResponseEntity.accepted().body(Map.of(
                "teamId", teamId,
                "message", requestPublisher.isEnabled()
                        ? "Team evaluation request published to Kafka."
                        : "Team evaluation queued."));
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
