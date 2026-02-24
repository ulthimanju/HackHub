package com.ehub.event.service;

import com.ehub.event.client.NotificationClient;
import com.ehub.event.dto.*;
import com.ehub.event.entity.Event;
import com.ehub.event.entity.Registration;
import com.ehub.event.entity.Team;
import com.ehub.event.entity.TeamMember;
import com.ehub.event.repository.EventRepository;
import com.ehub.event.repository.ProblemStatementRepository;
import com.ehub.event.repository.RegistrationRepository;
import com.ehub.event.repository.TeamMemberRepository;
import com.ehub.event.repository.TeamRepository;
import com.ehub.event.enums.EventStatus;
import com.ehub.event.enums.RegistrationStatus;
import com.ehub.event.enums.TeamMemberStatus;
import com.ehub.event.enums.TeamRole;
import com.ehub.event.util.MessageKeys;
import lombok.RequiredArgsConstructor;
import com.ehub.event.exception.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final ProblemStatementRepository problemStatementRepository;
    private final NotificationClient notificationClient;

    @Transactional
    public void createTeam(String eventId, TeamCreateRequest request, String userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        // Constraint: Check if event has already started
        if (event.getStartDate() != null && java.time.LocalDateTime.now().isAfter(event.getStartDate())) {
            throw new IllegalStateException(MessageKeys.TEAM_EVENT_STARTED.getMessage());
        }

        // Constraint: User must have an APPROVED registration for this event
        Registration registration = registrationRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new IllegalStateException(MessageKeys.MUST_BE_REGISTERED_TO_CREATE_TEAM.getMessage()));
        if (registration.getStatus() != RegistrationStatus.APPROVED) {
            throw new IllegalStateException(MessageKeys.REGISTRATION_NOT_APPROVED_TEAM.getMessage());
        }

        // Constraint: User can only be in ONE team per event
        if (teamMemberRepository.existsByTeamEventIdAndUserIdAndStatus(eventId, userId, TeamMemberStatus.ACCEPTED)) {
            throw new IllegalStateException(MessageKeys.ALREADY_IN_TEAM_THIS_EVENT.getMessage());
        }

        Team team = Team.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName())
                .eventId(eventId)
                .leaderId(userId)
                .shortCode(generateShortCode())
                .score(0.0)
                .skillsNeeded(request.getSkillsNeeded())
                .build();

        Team savedTeam = teamRepository.save(team);

        TeamMember leader = TeamMember.builder()
                .id(UUID.randomUUID().toString())
                .team(savedTeam)
                .userId(userId)
                .username(request.getUsername())
                .userEmail(request.getUserEmail())
                .role(TeamRole.LEADER)
                .status(TeamMemberStatus.ACCEPTED)
                .build();

        teamMemberRepository.save(leader);
    }

    public List<TeamResponse> getTeamsByEvent(String eventId, String name) {
        List<Team> teams = teamRepository.findByEventId(eventId);
        if (name != null && !name.isBlank()) {
            String lower = name.toLowerCase();
            teams = teams.stream()
                    .filter(t -> t.getName().toLowerCase().contains(lower))
                    .toList();
        }
        return teams.stream().map(this::mapToTeamResponse).toList();
    }

    public Page<TeamResponse> getTeamsByEvent(String eventId, String name, Pageable pageable) {
        Page<Team> page = teamRepository.findByEventId(eventId, pageable);
        List<Team> teams = page.getContent();
        if (name != null && !name.isBlank()) {
            String lower = name.toLowerCase();
            teams = teams.stream().filter(t -> t.getName().toLowerCase().contains(lower)).toList();
        }
        List<TeamResponse> content = teams.stream().map(this::mapToTeamResponse).toList();
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    public TeamResponse getTeamByShortCode(String shortCode) {
        Team team = teamRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));
        return mapToTeamResponse(team);
    }

    @Transactional
    public void inviteMember(String teamId, TeamInviteRequest request, String requesterId) {
        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, request.getUserId())) {
            throw new IllegalStateException(MessageKeys.USER_ALREADY_ASSOCIATED.getMessage());
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));

        if (!team.getLeaderId().equals(requesterId)) {
            throw new AccessDeniedException(MessageKeys.UNAUTHORIZED_TEAM_INVITE.getMessage());
        }

        // Constraint: Check team size limit
        Event event = eventRepository.findById(team.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        if (isEventLocked(event.getStatus())) {
            throw new IllegalStateException(MessageKeys.EVENT_LOCKED.getMessage());
        }

        // Constraint: User must have an APPROVED registration for this event
        Registration registration = registrationRepository.findByEventIdAndUserId(event.getId(), request.getUserId())
                .orElseThrow(() -> new IllegalStateException(MessageKeys.USER_NOT_REGISTERED_FOR_INVITE.getMessage()));
        if (registration.getStatus() != RegistrationStatus.APPROVED) {
            throw new IllegalStateException(MessageKeys.INVITE_REGISTRATION_NOT_APPROVED.getMessage());
        }

        // Constraint: User can only be in ONE team per event
        if (teamMemberRepository.existsByTeamEventIdAndUserIdAndStatus(event.getId(), request.getUserId(), TeamMemberStatus.ACCEPTED)) {
            throw new IllegalStateException(MessageKeys.USER_ALREADY_IN_OTHER_TEAM.getMessage());
        }

        if (event.getTeamSize() != null) {
            long currentMembers = teamMemberRepository.findByTeamId(teamId).stream()
                    .filter(m -> m.getStatus() == TeamMemberStatus.ACCEPTED || m.getStatus() == TeamMemberStatus.INVITED)
                    .count();
            if (currentMembers >= event.getTeamSize()) {
                throw new IllegalStateException(MessageKeys.TEAM_AT_MAX_CAPACITY.getMessage());
            }
        }

        TeamMember member = TeamMember.builder()
                .id(UUID.randomUUID().toString())
                .team(team)
                .userId(request.getUserId())
                .username(request.getUsername())
                .userEmail(request.getUserEmail())
                .role(TeamRole.MEMBER)
                .status(TeamMemberStatus.INVITED)
                .build();

        teamMemberRepository.save(member);

        // Send Notification
        String subject = "Mission Invitation: Join " + team.getName();
        String message = "You have been invited to join team " + team.getName() + " for the " + event.getName() + " hackathon. Log in to accept!";
        notificationClient.sendEmail(request.getUserEmail(), subject, message);
    }

    @Transactional
    public void requestToJoin(String teamId, TeamInviteRequest request) {
        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, request.getUserId())) {
            throw new IllegalStateException(MessageKeys.ALREADY_REQUESTED_OR_MEMBER.getMessage());
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));

        // Constraint: Check team size limit
        Event event = eventRepository.findById(team.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        if (isEventLocked(event.getStatus())) {
            throw new IllegalStateException(MessageKeys.EVENT_LOCKED.getMessage());
        }

        // Constraint: User must have an APPROVED registration for this event
        Registration registration = registrationRepository.findByEventIdAndUserId(event.getId(), request.getUserId())
                .orElseThrow(() -> new IllegalStateException(MessageKeys.MUST_BE_REGISTERED_TO_JOIN.getMessage()));
        if (registration.getStatus() != RegistrationStatus.APPROVED) {
            throw new IllegalStateException(MessageKeys.REGISTRATION_NOT_APPROVED_JOIN.getMessage());
        }

        // Constraint: User can only be in ONE team per event
        if (teamMemberRepository.existsByTeamEventIdAndUserIdAndStatus(event.getId(), request.getUserId(), TeamMemberStatus.ACCEPTED)) {
            throw new IllegalStateException(MessageKeys.ALREADY_IN_TEAM_THIS_EVENT.getMessage());
        }

        if (event.getTeamSize() != null) {
            long currentMembers = teamMemberRepository.findByTeamId(teamId).stream()
                    .filter(m -> m.getStatus() == TeamMemberStatus.ACCEPTED)
                    .count();
            if (currentMembers >= event.getTeamSize()) {
                throw new IllegalStateException(MessageKeys.TEAM_FULL.getMessage());
            }
        }

        TeamMember member = TeamMember.builder()
                .id(UUID.randomUUID().toString())
                .team(team)
                .userId(request.getUserId())
                .username(request.getUsername())
                .userEmail(request.getUserEmail())
                .role(TeamRole.MEMBER)
                .status(TeamMemberStatus.REQUESTED)
                .build();

        teamMemberRepository.save(member);
    }

    @Transactional
    public void respondToInvite(String teamId, String userId, boolean accept) {
        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.MEMBERSHIP_NOT_FOUND.getMessage()));

        // Only INVITED members can self-respond; REQUESTED members must be handled by the leader
        if (member.getStatus() == TeamMemberStatus.REQUESTED && accept) {
            throw new AccessDeniedException(MessageKeys.NOT_TEAM_LEADER.getMessage());
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));

        Event event = eventRepository.findById(team.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        if (isEventLocked(event.getStatus())) {
            throw new IllegalStateException(MessageKeys.EVENT_LOCKED.getMessage());
        }

        if (accept) {
            // Constraint: User can only be in ONE team per event
            if (teamMemberRepository.existsByTeamEventIdAndUserIdAndStatus(team.getEventId(), userId, TeamMemberStatus.ACCEPTED)) {
                throw new IllegalStateException(MessageKeys.ALREADY_IN_TEAM_THIS_EVENT.getMessage());
            }

            member.setStatus(TeamMemberStatus.ACCEPTED);
            teamMemberRepository.save(member);
        } else {
            teamMemberRepository.delete(member);
        }
    }

    @Transactional
    public void dismantleTeam(String teamId, String leaderId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));

        if (!team.getLeaderId().equals(leaderId)) {
            throw new AccessDeniedException(MessageKeys.ONLY_LEADER_CAN_DISMANTLE.getMessage());
        }

        Event event = eventRepository.findById(team.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        if (isEventLocked(event.getStatus())) {
            throw new IllegalStateException(MessageKeys.EVENT_LOCKED.getMessage());
        }

        teamRepository.delete(team);
    }

    @Transactional
    public void transferLeadership(String teamId, String currentLeaderId, String newLeaderId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));

        if (!team.getLeaderId().equals(currentLeaderId)) {
            throw new AccessDeniedException(MessageKeys.ONLY_LEADER_CAN_TRANSFER.getMessage());
        }

        TeamMember currentLeader = teamMemberRepository.findByTeamIdAndUserId(teamId, currentLeaderId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.LEADER_NOT_FOUND.getMessage()));
        TeamMember nextLeader = teamMemberRepository.findByTeamIdAndUserId(teamId, newLeaderId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.MEMBER_NOT_FOUND.getMessage()));

        currentLeader.setRole(TeamRole.MEMBER);
        nextLeader.setRole(TeamRole.LEADER);
        team.setLeaderId(newLeaderId);

        teamMemberRepository.save(currentLeader);
        teamMemberRepository.save(nextLeader);
        teamRepository.save(team);
    }

    @Transactional
    public void leaveTeam(String teamId, String userId) {
        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.MEMBERSHIP_NOT_FOUND.getMessage()));

        if (member.getRole() == TeamRole.LEADER) {
            throw new IllegalStateException(MessageKeys.LEADER_CANNOT_LEAVE.getMessage());
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));

        Event event = eventRepository.findById(team.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        if (isEventLocked(event.getStatus())) {
            throw new IllegalStateException(MessageKeys.EVENT_LOCKED.getMessage());
        }

        teamMemberRepository.delete(member);
    }

    @Transactional
    public void updateProblemStatement(String teamId, String leaderId, String problemId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));

        if (!team.getLeaderId().equals(leaderId)) {
            throw new AccessDeniedException(MessageKeys.ONLY_LEADER_CAN_SELECT_PROBLEM.getMessage());
        }

        team.setProblemStatementId(problemId);
        teamRepository.save(team);
    }

    @Transactional
    public void submitProject(String teamId, String userId, TeamSubmissionRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));

        if (!team.getLeaderId().equals(userId)) {
            throw new AccessDeniedException(MessageKeys.ONLY_LEADER_CAN_SUBMIT.getMessage());
        }

        // Constraint: Check if event is ongoing
        Event event = eventRepository.findById(team.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        
        if (event.calculateCurrentStatus() != EventStatus.ONGOING) {
            if (java.time.LocalDateTime.now().isBefore(event.getStartDate())) {
                throw new IllegalStateException(String.format(MessageKeys.SUBMISSIONS_NOT_OPEN.getMessage(), event.getStartDate()));
            } else {
                throw new IllegalStateException(String.format(MessageKeys.SUBMISSIONS_CLOSED.getMessage(), event.getEndDate()));
            }
        }

        // Block if score has already been announced
        if (team.getScore() != null && team.getScore() > 0) {
            throw new IllegalStateException(MessageKeys.SUBMISSION_BLOCKED_SCORE_ANNOUNCED.getMessage());
        }

        team.setRepoUrl(request.getRepoUrl());
        team.setSubmissionTime(java.time.LocalDateTime.now());
        teamRepository.save(team);
    }

    public Map<String, Object> getTeamForEvaluation(String teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));
        return mapToEvaluationMap(team);
    }

    public List<Map<String, Object>> getEventEvaluationContext(String eventId) {
        List<Team> teams = teamRepository.findByEventId(eventId);
        return teams.stream()
                .filter(t -> t.getRepoUrl() != null && !t.getRepoUrl().isBlank())
                .map(this::mapToEvaluationMap)
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

    /** Leader accepts or rejects a pending join request from another user. */
    @Transactional
    public void respondToJoinRequest(String teamId, String leaderId, String requestingUserId, boolean accept) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));

        if (!team.getLeaderId().equals(leaderId)) {
            throw new AccessDeniedException(MessageKeys.NOT_TEAM_LEADER.getMessage());
        }

        Event event = eventRepository.findById(team.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        if (isEventLocked(event.getStatus())) {
            throw new IllegalStateException(MessageKeys.EVENT_LOCKED.getMessage());
        }

        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, requestingUserId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.MEMBERSHIP_NOT_FOUND.getMessage()));

        if (member.getStatus() != TeamMemberStatus.REQUESTED) {
            throw new IllegalStateException("No pending join request from this user.");
        }

        if (accept) {
            if (teamMemberRepository.existsByTeamEventIdAndUserIdAndStatus(
                    team.getEventId(), requestingUserId, TeamMemberStatus.ACCEPTED)) {
                throw new IllegalStateException(MessageKeys.ALREADY_IN_TEAM_THIS_EVENT.getMessage());
            }
            if (event.getTeamSize() != null) {
                long current = teamMemberRepository.findByTeamId(teamId).stream()
                        .filter(m -> m.getStatus() == TeamMemberStatus.ACCEPTED).count();
                if (current >= event.getTeamSize()) {
                    throw new IllegalStateException(MessageKeys.TEAM_AT_MAX_CAPACITY.getMessage());
                }
            }
            member.setStatus(TeamMemberStatus.ACCEPTED);
            teamMemberRepository.save(member);
        } else {
            teamMemberRepository.delete(member);
        }
    }

    /** Fetches the event for the given teamId and verifies the requester is its owner. */
    private Event requireEventOwnershipForTeam(String teamId, String requesterId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));
        Event event = eventRepository.findById(team.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        if (!event.getOrganizerId().equals(requesterId)) {
            throw new AccessDeniedException(MessageKeys.UNAUTHORIZED_ORGANIZER.getMessage());
        }
        return event;
    }

    private String generateShortCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private Map<String, Object> mapToEvaluationMap(Team team) {
        Map<String, Object> map = new HashMap<>();
        map.put("teamId", team.getId());
        map.put("teamName", team.getName());
        map.put("repoUrl", team.getRepoUrl());

        if (team.getProblemStatementId() != null) {
            problemStatementRepository.findById(team.getProblemStatementId())
                    .ifPresent(ps -> {
                        map.put("problemStatement", ps.getStatement());
                        if (ps.getRequirements() != null) map.put("requirements", ps.getRequirements());
                    });
        }

        eventRepository.findById(team.getEventId())
                .ifPresent(event -> {
                    if (event.getTheme() != null) map.put("theme", event.getTheme());
                });

        return map;
    }

    @Transactional
    public void updateSkillsNeeded(String teamId, List<String> skills, String requesterId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));
        if (!team.getLeaderId().equals(requesterId)) {
            throw new AccessDeniedException(MessageKeys.UNAUTHORIZED_TEAM_INVITE.getMessage());
        }
        team.setSkillsNeeded(skills);
        teamRepository.save(team);
    }

    private TeamResponse mapToTeamResponse(Team team) {
        List<TeamResponse.TeamMemberResponse> memberDtos = teamMemberRepository.findByTeamId(team.getId())
                .stream()
                .map(this::mapToTeamMemberResponse)
                .toList();

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
                .members(memberDtos)
                .build();
    }

    private TeamResponse.TeamMemberResponse mapToTeamMemberResponse(com.ehub.event.entity.TeamMember m) {
        return TeamResponse.TeamMemberResponse.builder()
                .id(m.getId())
                .userId(m.getUserId())
                .username(m.getUsername())
                .userEmail(m.getUserEmail())
                .role(m.getRole())
                .status(m.getStatus())
                .build();
    }

    private boolean isEventLocked(EventStatus status) {
        return status == EventStatus.JUDGING
                || status == EventStatus.RESULTS_ANNOUNCED
                || status == EventStatus.COMPLETED;
    }
}