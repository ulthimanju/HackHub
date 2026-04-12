package com.ehub.event.service;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ehub.event.dto.TeamCreateRequest;
import com.ehub.event.dto.TeamInviteRequest;
import com.ehub.event.dto.TeamResponse;
import com.ehub.event.dto.TeamSubmissionRequest;
import com.ehub.event.facade.TeamFacade;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamFacade teamFacade;

    public void createTeam(String eventId, TeamCreateRequest request, String userId) {
        teamFacade.createTeam(eventId, request, userId);
    }

    public List<TeamResponse> getTeamsByEvent(String eventId, String name) {
        return teamFacade.getTeamsByEvent(eventId, name);
    }

    public Page<TeamResponse> getTeamsByEvent(String eventId, String name, Pageable pageable) {
        return teamFacade.getTeamsByEvent(eventId, name, pageable);
    }

    public TeamResponse getTeamByShortCode(String shortCode) {
        return teamFacade.getTeamByShortCode(shortCode);
    }

    public void inviteMember(String teamId, TeamInviteRequest request, String requesterId) {
        teamFacade.inviteMember(teamId, request, requesterId);
    }

    public void requestToJoin(String teamId, TeamInviteRequest request) {
        teamFacade.requestToJoin(teamId, request);
    }

    public void respondToInvite(String teamId, String userId, boolean accept) {
        teamFacade.respondToInvite(teamId, userId, accept);
    }

    public void respondToJoinRequest(String teamId, String leaderId, String requestingUserId, boolean accept) {
        teamFacade.respondToJoinRequest(teamId, leaderId, requestingUserId, accept);
    }

    public void dismantleTeam(String teamId, String leaderId) {
        teamFacade.dismantleTeam(teamId, leaderId);
    }

    public void transferLeadership(String teamId, String currentLeaderId, String newLeaderId) {
        teamFacade.transferLeadership(teamId, currentLeaderId, newLeaderId);
    }

    public void leaveTeam(String teamId, String userId) {
        teamFacade.leaveTeam(teamId, userId);
    }

    public void updateProblemStatement(String teamId, String leaderId, String problemId) {
        teamFacade.updateProblemStatement(teamId, leaderId, problemId);
    }

    public void submitProject(String teamId, String userId, TeamSubmissionRequest request) {
        teamFacade.submitProject(teamId, userId, request);
    }

    public Map<String, Object> getTeamForEvaluation(String teamId) {
        return teamFacade.getTeamForEvaluation(teamId);
    }

    public List<Map<String, Object>> getEventEvaluationContext(String eventId) {
        return teamFacade.getEventEvaluationContext(eventId);
    }

    public void updateScore(String teamId, Double score, String aiSummary, String requesterId) {
        teamFacade.updateScore(teamId, score, aiSummary, requesterId);
    }

    public void updateManualReview(String teamId, Double manualScore, String organizerNotes, String requesterId) {
        teamFacade.updateManualReview(teamId, manualScore, organizerNotes, requesterId);
    }

    public void updateSkillsNeeded(String teamId, List<String> skills, String requesterId) {
        teamFacade.updateSkillsNeeded(teamId, skills, requesterId);
    }
}
