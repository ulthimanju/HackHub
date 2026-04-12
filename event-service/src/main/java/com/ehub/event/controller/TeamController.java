package com.ehub.event.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
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

import com.ehub.event.dto.ManualReviewRequest;
import com.ehub.event.dto.SkillsNeededRequest;
import com.ehub.event.dto.TeamCreateRequest;
import com.ehub.event.dto.TeamInviteRequest;
import com.ehub.event.dto.TeamResponse;
import com.ehub.event.dto.TeamSubmissionRequest;
import com.ehub.event.facade.TeamFacade;
import com.ehub.event.util.MessageKeys;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/events/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamFacade teamFacade;

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping("/{eventId}")
    public ResponseEntity<String> createTeam(@PathVariable String eventId,
            @Valid @RequestBody TeamCreateRequest request) {
        teamFacade.createTeam(eventId, request, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.TEAM_CREATED.getMessage());
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<Page<TeamResponse>> getTeamsByEvent(
            @PathVariable String eventId,
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size) {
        return ResponseEntity.ok(teamFacade.getTeamsByEvent(eventId, name, PageRequest.of(page, size)));
    }

    @GetMapping("/code/{shortCode}")
    public ResponseEntity<TeamResponse> getTeamByShortCode(@PathVariable String shortCode) {
        return ResponseEntity.ok(teamFacade.getTeamByShortCode(shortCode));
    }

    @PatchMapping("/{teamId}/skills-needed")
    public ResponseEntity<String> updateSkillsNeeded(
            @PathVariable String teamId,
            @RequestBody SkillsNeededRequest request) {
        teamFacade.updateSkillsNeeded(teamId, request.getSkills(), getCurrentUserId());
        return ResponseEntity.ok("Skills updated successfully");
    }

    @PostMapping("/{teamId}/invite")
    public ResponseEntity<String> inviteMember(
            @PathVariable String teamId,
            @RequestBody TeamInviteRequest request) {
        teamFacade.inviteMember(teamId, request, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.TEAM_INVITE_SENT.getMessage());
    }

    @PostMapping("/{teamId}/request")
    public ResponseEntity<String> requestToJoin(@PathVariable String teamId, @RequestBody TeamInviteRequest request) {
        request.setUserId(getCurrentUserId());
        teamFacade.requestToJoin(teamId, request);
        return ResponseEntity.ok(MessageKeys.TEAM_JOIN_REQUEST_SENT.getMessage());
    }

    @PatchMapping("/{teamId}/respond")
    public ResponseEntity<String> respondToInvite(
            @PathVariable String teamId,
            @RequestParam boolean accept) {
        teamFacade.respondToInvite(teamId, getCurrentUserId(), accept);
        return ResponseEntity.ok(MessageKeys.TEAM_STATUS_UPDATED.getMessage());
    }

    @PatchMapping("/{teamId}/requests/{requestingUserId}/respond")
    public ResponseEntity<String> respondToJoinRequest(
            @PathVariable String teamId,
            @PathVariable String requestingUserId,
            @RequestParam boolean accept) {
        teamFacade.respondToJoinRequest(teamId, getCurrentUserId(), requestingUserId, accept);
        return ResponseEntity.ok(MessageKeys.TEAM_STATUS_UPDATED.getMessage());
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<String> dismantleTeam(@PathVariable String teamId) {
        teamFacade.dismantleTeam(teamId, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.TEAM_DISMANTLED.getMessage());
    }

    @PatchMapping("/{teamId}/transfer")
    public ResponseEntity<String> transferLeadership(
            @PathVariable String teamId,
            @RequestParam String newLeaderId) {
        teamFacade.transferLeadership(teamId, getCurrentUserId(), newLeaderId);
        return ResponseEntity.ok(MessageKeys.TEAM_LEADERSHIP_TRANSFERRED.getMessage());
    }

    @DeleteMapping("/{teamId}/leave")
    public ResponseEntity<String> leaveTeam(@PathVariable String teamId) {
        teamFacade.leaveTeam(teamId, getCurrentUserId());
        return ResponseEntity.ok(MessageKeys.TEAM_LEAVE_SUCCESS.getMessage());
    }

    @PatchMapping("/{teamId}/problem-statement")
    public ResponseEntity<String> selectProblemStatement(
            @PathVariable String teamId,
            @RequestParam(required = false) String problemId) {
        teamFacade.updateProblemStatement(teamId, getCurrentUserId(), problemId);
        return ResponseEntity.ok(MessageKeys.PROBLEM_UPDATED.getMessage());
    }

    @PostMapping("/{teamId}/submit")
    public ResponseEntity<String> submitProject(
            @PathVariable String teamId,
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
    public ResponseEntity<String> updateManualReview(
            @PathVariable String teamId,
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