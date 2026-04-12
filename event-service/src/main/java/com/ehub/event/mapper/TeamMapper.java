package com.ehub.event.mapper;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.ehub.event.dto.TeamResponse;
import com.ehub.event.dto.TeamSubmissionRequest;
import com.ehub.event.entity.Team;
import com.ehub.event.entity.TeamMember;

@Component
public class TeamMapper {

    public TeamResponse toTeamResponse(Team team, List<TeamMember> members) {
        return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .shortCode(team.getShortCode())
                .eventId(team.getEventId())
                .problemStatementId(team.getProblemStatementId())
                .repoUrl(team.getRepoUrl())
                .demoUrl(team.getDemoUrl())
                .submissionTime(team.getSubmissionTime())
                .leaderId(team.getLeaderId())
                .score(team.getScore())
                .aiSummary(team.getAiSummary())
                .manualScore(team.getManualScore())
                .finalScore(team.getFinalScore())
                .organizerNotes(team.getOrganizerNotes())
                .skillsNeeded(team.getSkillsNeeded())
                .members(members.stream().map(this::toTeamMemberResponse).toList())
                .build();
    }

    public TeamResponse.TeamMemberResponse toTeamMemberResponse(TeamMember member) {
        return TeamResponse.TeamMemberResponse.builder()
                .id(member.getId())
                .userId(member.getUserId())
                .username(member.getUsername())
                .userEmail(member.getUserEmail())
                .role(member.getRole())
                .status(member.getStatus())
                .build();
    }

    public void applySubmission(Team team, TeamSubmissionRequest request, LocalDateTime submittedAt) {
        team.setRepoUrl(request.getRepoUrl());
        team.setDemoUrl(request.getDemoUrl());
        team.setSubmissionTime(submittedAt);
    }

    public Map<String, Object> toEvaluationContext(
            Team team,
            String problemStatement,
            String requirements,
            String theme) {
        Map<String, Object> map = new HashMap<>();
        map.put("teamId", team.getId());
        map.put("teamName", team.getName());
        map.put("repoUrl", team.getRepoUrl());
        if (problemStatement != null) {
            map.put("problemStatement", problemStatement);
        }
        if (requirements != null) {
            map.put("requirements", requirements);
        }
        if (theme != null) {
            map.put("theme", theme);
        }
        return map;
    }
}
