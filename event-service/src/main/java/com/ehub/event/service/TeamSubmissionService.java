package com.ehub.event.service;

import java.util.List;
import java.util.Map;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ehub.event.dto.TeamSubmissionRequest;
import com.ehub.event.shared.entity.Event;
import com.ehub.event.shared.entity.Team;
import com.ehub.event.shared.enums.EventStatus;
import com.ehub.event.exception.ResourceNotFoundException;
import com.ehub.event.exception.TeamSubmissionException;
import com.ehub.event.shared.mapper.TeamMapper;
import com.ehub.event.shared.port.TeamClock;
import com.ehub.event.shared.repository.EventRepository;
import com.ehub.event.shared.repository.ProblemStatementRepository;
import com.ehub.event.shared.repository.TeamRepository;
import com.ehub.event.util.MessageKeys;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeamSubmissionService {

    private final TeamRepository teamRepository;
    private final EventRepository eventRepository;
    private final ProblemStatementRepository problemStatementRepository;
    private final TeamMapper teamMapper;
    private final TeamClock teamClock;
    private final OutboxService outboxService;

    @Transactional
    public void submitProject(String teamId, String userId, TeamSubmissionRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));

        if (!team.getLeaderId().equals(userId)) {
            throw new AccessDeniedException(MessageKeys.ONLY_LEADER_CAN_SUBMIT.getMessage());
        }

        Event event = eventRepository.findById(team.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        EventStatus currentStatus = event.calculateCurrentStatus(teamClock.now());
        if (currentStatus != EventStatus.ONGOING) {
            if (event.getStartDate() != null && teamClock.now().isBefore(event.getStartDate())) {
                throw new TeamSubmissionException(
                        String.format(MessageKeys.SUBMISSIONS_NOT_OPEN.getMessage(), event.getStartDate()));
            }
            throw new TeamSubmissionException(
                    String.format(MessageKeys.SUBMISSIONS_CLOSED.getMessage(), event.getEndDate()));
        }

        if (team.getScore() != null && team.getScore() > 0) {
            throw new TeamSubmissionException(MessageKeys.SUBMISSION_BLOCKED_SCORE_ANNOUNCED.getMessage());
        }

        teamMapper.applySubmission(team, request, teamClock.now());
        teamRepository.save(team);

        outboxService.enqueue(
                "team",
                teamId,
                "ai.evaluation.requested",
                Map.of(
                        "type", "TEAM",
                        "eventId", event.getId(),
                        "teamId", teamId,
                        "repoUrl", request.getRepoUrl(),
                        "demoUrl", request.getDemoUrl() != null ? request.getDemoUrl() : "",
                        "requestedAt", teamClock.now().toString()));
    }

    public Map<String, Object> getTeamForEvaluation(String teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));
        return buildEvaluationContext(team);
    }

    public List<Map<String, Object>> getEventEvaluationContext(String eventId) {
        return teamRepository.findByEventId(eventId).stream()
                .filter(t -> t.getRepoUrl() != null && !t.getRepoUrl().isBlank())
                .map(this::buildEvaluationContext)
                .toList();
    }

    @Transactional
    public void updateScore(String teamId, Double score, String aiSummary, String requesterId) {
        requireEventOwnershipForTeam(teamId, requesterId);
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));
        team.setScore(score);
        team.setAiSummary(aiSummary);
        teamRepository.save(team);
    }

    @Transactional
    public void updateManualReview(String teamId, Double manualScore, String organizerNotes, String requesterId) {
        requireEventOwnershipForTeam(teamId, requesterId);
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));
        team.setManualScore(manualScore);
        team.setOrganizerNotes(organizerNotes);
        teamRepository.save(team);
    }

    private Event requireEventOwnershipForTeam(String teamId, String requesterId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));
        if ("system".equals(requesterId)) {
            return eventRepository.findById(team.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        }
        Event event = eventRepository.findById(team.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        if (!event.getOrganizerId().equals(requesterId)) {
            throw new AccessDeniedException(MessageKeys.UNAUTHORIZED_ORGANIZER.getMessage());
        }
        return event;
    }

    private Map<String, Object> buildEvaluationContext(Team team) {
        String problemStatement = null;
        String requirements = null;
        if (team.getProblemStatementId() != null) {
            var psOpt = problemStatementRepository.findById(team.getProblemStatementId());
            if (psOpt.isPresent()) {
                problemStatement = psOpt.get().getStatement();
                requirements = psOpt.get().getRequirements();
            }
        }

        String theme = eventRepository.findById(team.getEventId())
                .map(Event::getTheme)
                .orElse(null);

        return teamMapper.toEvaluationContext(team, problemStatement, requirements, theme);
    }
}
