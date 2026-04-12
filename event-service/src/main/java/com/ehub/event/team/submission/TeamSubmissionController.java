package com.ehub.event.team.submission;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ehub.event.dto.ManualReviewRequest;
import com.ehub.event.dto.TeamSubmissionRequest;
import com.ehub.event.facade.TeamFacade;
import com.ehub.event.util.MessageKeys;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/events/teams")
@RequiredArgsConstructor
public class TeamSubmissionController {

    private final TeamFacade teamFacade;

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping("/{teamId}/submit")
    public ResponseEntity<String> submitProject(@PathVariable String teamId,
            @Valid @RequestBody TeamSubmissionRequest request) {
        teamFacade.submitProject(teamId, getCurrentUserId(), request);
        return ResponseEntity.ok(MessageKeys.PROJECT_SUBMITTED_SUCCESS.getMessage());
    }

    @GetMapping("/{teamId}/evaluation-context")
    public ResponseEntity<Map<String, Object>> getTeamEvaluationContext(@PathVariable String teamId) {
        return ResponseEntity.ok(teamFacade.getTeamForEvaluation(teamId));
    }

    @GetMapping("/event/{eventId}/evaluation-context")
    public ResponseEntity<List<Map<String, Object>>> getEventEvaluationContext(@PathVariable String eventId) {
        return ResponseEntity.ok(teamFacade.getEventEvaluationContext(eventId));
    }

    @PatchMapping("/{teamId}/manual-review")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<String> updateManualReview(@PathVariable String teamId,
            @RequestBody ManualReviewRequest request) {
        teamFacade.updateManualReview(teamId, request.getManualScore(), request.getOrganizerNotes(),
                getCurrentUserId());
        return ResponseEntity.ok("Review saved");
    }

    @PostMapping("/{teamId}/score")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ORGANIZER', 'SYSTEM')")
    public ResponseEntity<Void> updateScore(
            @PathVariable String teamId,
            @RequestParam Double score,
            @RequestParam(required = false) String aiSummary) {
        teamFacade.updateScore(teamId, score, aiSummary, getCurrentUserId());
        return ResponseEntity.ok().build();
    }
}
