package com.ehub.event.facade;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ehub.event.dto.TeamCreateRequest;
import com.ehub.event.dto.TeamInviteRequest;
import com.ehub.event.dto.TeamResponse;
import com.ehub.event.dto.TeamSubmissionRequest;
import com.ehub.event.team.query.TeamQueryService;
import com.ehub.event.team.roster.TeamRosterService;
import com.ehub.event.team.submission.TeamSubmissionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeamFacade {

    private final TeamRosterService rosterService;
    private final TeamSubmissionService submissionService;
    private final TeamQueryService queryService;

    public void createTeam(String eventId, TeamCreateRequest request, String userId) {
        rosterService.createTeam(eventId, request, userId);
    }

    public List<TeamResponse> getTeamsByEvent(String eventId, String name) {
        return queryService.getTeamsByEvent(eventId, name);
    }

    public Page<TeamResponse> getTeamsByEvent(String eventId, String name, Pageable pageable) {
        return queryService.getTeamsByEvent(eventId, name, pageable);
    }

    public TeamResponse getTeamByShortCode(String shortCode) {
        return queryService.getTeamByShortCode(shortCode);
    }

    public void inviteMember(String teamId, TeamInviteRequest request, String requesterId) {
        rosterService.inviteMember(teamId, request, requesterId);
    }

    public void requestToJoin(String teamId, TeamInviteRequest request) {
        rosterService.requestToJoin(teamId, request);
    }

    public void respondToInvite(String teamId, String userId, boolean accept) {
        rosterService.respondToInvite(teamId, userId, accept);
    }

    public void respondToJoinRequest(String teamId, String leaderId, String requestingUserId, boolean accept) {
        rosterService.respondToJoinRequest(teamId, leaderId, requestingUserId, accept);
    }

    public void dismantleTeam(String teamId, String leaderId) {
        rosterService.dismantleTeam(teamId, leaderId);
    }

    public void transferLeadership(String teamId, String currentLeaderId, String newLeaderId) {
        rosterService.transferLeadership(teamId, currentLeaderId, newLeaderId);
    }

    public void leaveTeam(String teamId, String userId) {
        rosterService.leaveTeam(teamId, userId);
    }

    public void updateProblemStatement(String teamId, String leaderId, String problemId) {
        rosterService.updateProblemStatement(teamId, leaderId, problemId);
    }

    public void submitProject(String teamId, String userId, TeamSubmissionRequest request) {
        submissionService.submitProject(teamId, userId, request);
    }

    public Map<String, Object> getTeamForEvaluation(String teamId) {
        return submissionService.getTeamForEvaluation(teamId);
    }

    public List<Map<String, Object>> getEventEvaluationContext(String eventId) {
        return submissionService.getEventEvaluationContext(eventId);
    }

    public void updateManualReview(String teamId, Double manualScore, String organizerNotes, String requesterId) {
        submissionService.updateManualReview(teamId, manualScore, organizerNotes, requesterId);
    }

    public void updateScore(String teamId, Double score, String aiSummary, String requesterId) {
        submissionService.updateScore(teamId, score, aiSummary, requesterId);
    }

    public void updateSkillsNeeded(String teamId, List<String> skills, String requesterId) {
        rosterService.updateSkillsNeeded(teamId, skills, requesterId);
    }
}
