package com.ehub.event.controller;

import com.ehub.event.dto.*;
import com.ehub.event.service.TeamService;
import com.ehub.event.util.MessageKeys;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/events/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping("/{eventId}")
    public ResponseEntity<String> createTeam(@PathVariable String eventId, @Valid @RequestBody TeamCreateRequest request) {
        teamService.createTeam(eventId, request);
        return ResponseEntity.ok(MessageKeys.TEAM_CREATED.getMessage());
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<List<TeamResponse>> getTeamsByEvent(@PathVariable String eventId) {
        return ResponseEntity.ok(teamService.getTeamsByEvent(eventId));
    }

    @GetMapping("/code/{shortCode}")
    public ResponseEntity<TeamResponse> getTeamByShortCode(@PathVariable String shortCode) {
        return ResponseEntity.ok(teamService.getTeamByShortCode(shortCode));
    }

    @PostMapping("/{teamId}/invite")
    public ResponseEntity<String> inviteMember(
            @PathVariable String teamId, 
            @RequestParam String leaderId,
            @RequestBody TeamInviteRequest request) {
        teamService.inviteMember(teamId, request, leaderId);
        return ResponseEntity.ok(MessageKeys.TEAM_INVITE_SENT.getMessage());
    }

    @PostMapping("/{teamId}/request")
    public ResponseEntity<String> requestToJoin(@PathVariable String teamId, @RequestBody TeamInviteRequest request) {
        teamService.requestToJoin(teamId, request);
        return ResponseEntity.ok(MessageKeys.TEAM_JOIN_REQUEST_SENT.getMessage());
    }

    @PatchMapping("/{teamId}/respond")
    public ResponseEntity<String> respondToInvite(
            @PathVariable String teamId, 
            @RequestParam String userId, 
            @RequestParam boolean accept) {
        teamService.respondToInvite(teamId, userId, accept);
        return ResponseEntity.ok(MessageKeys.TEAM_STATUS_UPDATED.getMessage());
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<String> dismantleTeam(@PathVariable String teamId, @RequestParam String leaderId) {
        teamService.dismantleTeam(teamId, leaderId);
        return ResponseEntity.ok(MessageKeys.TEAM_DISMANTLED.getMessage());
    }

    @PatchMapping("/{teamId}/transfer")
    public ResponseEntity<String> transferLeadership(
            @PathVariable String teamId, 
            @RequestParam String currentLeaderId, 
            @RequestParam String newLeaderId) {
        teamService.transferLeadership(teamId, currentLeaderId, newLeaderId);
        return ResponseEntity.ok(MessageKeys.TEAM_LEADERSHIP_TRANSFERRED.getMessage());
    }

    @DeleteMapping("/{teamId}/leave")
    public ResponseEntity<String> leaveTeam(@PathVariable String teamId, @RequestParam String userId) {
        teamService.leaveTeam(teamId, userId);
        return ResponseEntity.ok(MessageKeys.TEAM_LEAVE_SUCCESS.getMessage());
    }

    @PatchMapping("/{teamId}/problem-statement")
    public ResponseEntity<String> selectProblemStatement(
            @PathVariable String teamId,
            @RequestParam String leaderId,
            @RequestParam(required = false) String problemId) {
        teamService.updateProblemStatement(teamId, leaderId, problemId);
        return ResponseEntity.ok(MessageKeys.PROBLEM_UPDATED.getMessage());
    }

    @PostMapping("/{teamId}/submit")
    public ResponseEntity<String> submitProject(
            @PathVariable String teamId,
            @RequestParam String userId,
            @Valid @RequestBody TeamSubmissionRequest request) {
        teamService.submitProject(teamId, userId, request);
        return ResponseEntity.ok(MessageKeys.PROJECT_SUBMITTED_SUCCESS.getMessage());
    }

    @GetMapping("/{teamId}/evaluation-context")
    public ResponseEntity<Map<String, Object>> getTeamEvaluationContext(@PathVariable String teamId) {
        return ResponseEntity.ok(teamService.getTeamForEvaluation(teamId));
    }

    @GetMapping("/event/{eventId}/evaluation-context")
    public ResponseEntity<List<Map<String, Object>>> getEventEvaluationContext(@PathVariable String eventId) {
        return ResponseEntity.ok(teamService.getEventEvaluationContext(eventId));
    }

    @PostMapping("/{teamId}/score")
    public ResponseEntity<Void> updateScore(
            @PathVariable String teamId, 
            @RequestParam Double score,
            @RequestParam(required = false) String aiSummary) {
        teamService.updateScore(teamId, score, aiSummary);
        return ResponseEntity.ok().build();
    }
}