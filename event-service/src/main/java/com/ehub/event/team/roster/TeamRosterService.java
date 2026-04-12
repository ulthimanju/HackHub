package com.ehub.event.team.roster;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ehub.event.dto.TeamCreateRequest;
import com.ehub.event.dto.TeamInviteRequest;
import com.ehub.event.shared.entity.Event;
import com.ehub.event.shared.entity.Registration;
import com.ehub.event.shared.entity.Team;
import com.ehub.event.shared.entity.TeamMember;
import com.ehub.event.shared.enums.EventStatus;
import com.ehub.event.shared.enums.RegistrationStatus;
import com.ehub.event.shared.enums.TeamMemberStatus;
import com.ehub.event.shared.enums.TeamRole;
import com.ehub.event.exception.ResourceNotFoundException;
import com.ehub.event.exception.TeamRosterException;
import com.ehub.event.shared.port.NotificationPort;
import com.ehub.event.shared.port.TeamClock;
import com.ehub.event.shared.repository.EventRepository;
import com.ehub.event.shared.repository.RegistrationRepository;
import com.ehub.event.shared.repository.TeamMemberRepository;
import com.ehub.event.shared.repository.TeamRepository;
import com.ehub.event.util.MessageKeys;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeamRosterService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final NotificationPort notificationPort;
    private final TeamClock teamClock;

    @Transactional
    public void createTeam(String eventId, TeamCreateRequest request, String userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        if (event.getStartDate() != null && teamClock.now().isAfter(event.getStartDate())) {
            throw new TeamRosterException(MessageKeys.TEAM_EVENT_STARTED.getMessage());
        }

        Registration registration = registrationRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(
                        () -> new TeamRosterException(MessageKeys.MUST_BE_REGISTERED_TO_CREATE_TEAM.getMessage()));
        if (registration.getStatus() != RegistrationStatus.APPROVED) {
            throw new TeamRosterException(MessageKeys.REGISTRATION_NOT_APPROVED_TEAM.getMessage());
        }

        if (teamMemberRepository.existsByTeamEventIdAndUserIdAndStatus(eventId, userId, TeamMemberStatus.ACCEPTED)) {
            throw new TeamRosterException(MessageKeys.ALREADY_IN_TEAM_THIS_EVENT.getMessage());
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

    @Transactional
    public void inviteMember(String teamId, TeamInviteRequest request, String requesterId) {
        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, request.getUserId())) {
            throw new TeamRosterException(MessageKeys.USER_ALREADY_ASSOCIATED.getMessage());
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));

        if (!team.getLeaderId().equals(requesterId)) {
            throw new AccessDeniedException(MessageKeys.UNAUTHORIZED_TEAM_INVITE.getMessage());
        }

        Event event = eventRepository.findById(team.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        if (isEventLocked(event.getStatus())) {
            throw new TeamRosterException(MessageKeys.EVENT_LOCKED.getMessage());
        }

        Registration registration = registrationRepository.findByEventIdAndUserId(event.getId(), request.getUserId())
                .orElseThrow(() -> new TeamRosterException(MessageKeys.USER_NOT_REGISTERED_FOR_INVITE.getMessage()));
        if (registration.getStatus() != RegistrationStatus.APPROVED) {
            throw new TeamRosterException(MessageKeys.INVITE_REGISTRATION_NOT_APPROVED.getMessage());
        }

        if (teamMemberRepository.existsByTeamEventIdAndUserIdAndStatus(event.getId(), request.getUserId(),
                TeamMemberStatus.ACCEPTED)) {
            throw new TeamRosterException(MessageKeys.USER_ALREADY_IN_OTHER_TEAM.getMessage());
        }

        if (event.getTeamSize() != null) {
            long currentMembers = teamMemberRepository.findByTeamId(teamId).stream()
                    .filter(m -> m.getStatus() == TeamMemberStatus.ACCEPTED
                            || m.getStatus() == TeamMemberStatus.INVITED)
                    .count();
            if (currentMembers >= event.getTeamSize()) {
                throw new TeamRosterException(MessageKeys.TEAM_AT_MAX_CAPACITY.getMessage());
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

        String subject = "Mission Invitation: Join " + team.getName();
        String message = "You have been invited to join team " + team.getName() + " for the " + event.getName()
                + " hackathon. Log in to accept!";
        notificationPort.sendEmail(request.getUserEmail(), subject, message);
    }

    @Transactional
    public void requestToJoin(String teamId, TeamInviteRequest request) {
        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, request.getUserId())) {
            throw new TeamRosterException(MessageKeys.ALREADY_REQUESTED_OR_MEMBER.getMessage());
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));

        Event event = eventRepository.findById(team.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        if (isEventLocked(event.getStatus())) {
            throw new TeamRosterException(MessageKeys.EVENT_LOCKED.getMessage());
        }

        Registration registration = registrationRepository.findByEventIdAndUserId(event.getId(), request.getUserId())
                .orElseThrow(() -> new TeamRosterException(MessageKeys.MUST_BE_REGISTERED_TO_JOIN.getMessage()));
        if (registration.getStatus() != RegistrationStatus.APPROVED) {
            throw new TeamRosterException(MessageKeys.REGISTRATION_NOT_APPROVED_JOIN.getMessage());
        }

        if (teamMemberRepository.existsByTeamEventIdAndUserIdAndStatus(event.getId(), request.getUserId(),
                TeamMemberStatus.ACCEPTED)) {
            throw new TeamRosterException(MessageKeys.ALREADY_IN_TEAM_THIS_EVENT.getMessage());
        }

        if (event.getTeamSize() != null) {
            long currentMembers = teamMemberRepository.findByTeamId(teamId).stream()
                    .filter(m -> m.getStatus() == TeamMemberStatus.ACCEPTED)
                    .count();
            if (currentMembers >= event.getTeamSize()) {
                throw new TeamRosterException(MessageKeys.TEAM_FULL.getMessage());
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

        if (member.getStatus() == TeamMemberStatus.REQUESTED && accept) {
            throw new AccessDeniedException(MessageKeys.NOT_TEAM_LEADER.getMessage());
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));

        Event event = eventRepository.findById(team.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        if (isEventLocked(event.getStatus())) {
            throw new TeamRosterException(MessageKeys.EVENT_LOCKED.getMessage());
        }

        if (accept) {
            if (teamMemberRepository.existsByTeamEventIdAndUserIdAndStatus(team.getEventId(), userId,
                    TeamMemberStatus.ACCEPTED)) {
                throw new IllegalStateException(MessageKeys.ALREADY_IN_TEAM_THIS_EVENT.getMessage());
            }
            member.setStatus(TeamMemberStatus.ACCEPTED);
            teamMemberRepository.save(member);
        } else {
            teamMemberRepository.delete(member);
        }
    }

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
            throw new TeamRosterException("No pending join request from this user.");
        }

        if (accept) {
            if (teamMemberRepository.existsByTeamEventIdAndUserIdAndStatus(team.getEventId(), requestingUserId,
                    TeamMemberStatus.ACCEPTED)) {
                throw new TeamRosterException(MessageKeys.ALREADY_IN_TEAM_THIS_EVENT.getMessage());
            }
            if (event.getTeamSize() != null) {
                long current = teamMemberRepository.findByTeamId(teamId).stream()
                        .filter(m -> m.getStatus() == TeamMemberStatus.ACCEPTED)
                        .count();
                if (current >= event.getTeamSize()) {
                    throw new TeamRosterException(MessageKeys.TEAM_AT_MAX_CAPACITY.getMessage());
                }
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
            throw new TeamRosterException(MessageKeys.EVENT_LOCKED.getMessage());
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
            throw new TeamRosterException(MessageKeys.LEADER_CANNOT_LEAVE.getMessage());
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));

        Event event = eventRepository.findById(team.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        if (isEventLocked(event.getStatus())) {
            throw new TeamRosterException(MessageKeys.EVENT_LOCKED.getMessage());
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
    public void updateSkillsNeeded(String teamId, List<String> skills, String requesterId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));
        if (!team.getLeaderId().equals(requesterId)) {
            throw new AccessDeniedException(MessageKeys.UNAUTHORIZED_TEAM_INVITE.getMessage());
        }
        team.setSkillsNeeded(skills);
        teamRepository.save(team);
    }

    private String generateShortCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private boolean isEventLocked(EventStatus status) {
        return status == EventStatus.JUDGING
                || status == EventStatus.RESULTS_ANNOUNCED
                || status == EventStatus.COMPLETED;
    }
}
