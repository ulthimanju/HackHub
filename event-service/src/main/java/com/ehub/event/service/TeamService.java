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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

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
    public void createTeam(String eventId, TeamCreateRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Constraint: Check if event has already started
        if (event.getStartDate() != null && java.time.LocalDateTime.now().isAfter(event.getStartDate())) {
            throw new RuntimeException("Teams cannot be formed once the event has started.");
        }

        // Constraint: User must have an APPROVED registration for this event
        Registration registration = registrationRepository.findByEventIdAndUserId(eventId, request.getUserId())
                .orElseThrow(() -> new RuntimeException("You must be registered for this event to create a team."));
        if (registration.getStatus() != RegistrationStatus.APPROVED) {
            throw new RuntimeException("Your registration for this event must be approved before you can create a team.");
        }

        // Constraint: User can only be in ONE team per event
        if (teamMemberRepository.existsByTeamEventIdAndUserIdAndStatus(eventId, request.getUserId(), TeamMemberStatus.ACCEPTED)) {
            throw new RuntimeException("You are already an accepted member of another team in this event.");
        }

        Team team = Team.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName())
                .eventId(eventId)
                .leaderId(request.getUserId())
                .shortCode(generateShortCode())
                .score(0.0)
                .build();

        Team savedTeam = teamRepository.save(team);

        TeamMember leader = TeamMember.builder()
                .id(UUID.randomUUID().toString())
                .team(savedTeam)
                .userId(request.getUserId())
                .username(request.getUsername())
                .userEmail(request.getUserEmail())
                .role(TeamRole.LEADER)
                .status(TeamMemberStatus.ACCEPTED)
                .build();

        teamMemberRepository.save(leader);
    }

    public List<TeamResponse> getTeamsByEvent(String eventId) {
        List<Team> teams = teamRepository.findByEventId(eventId);
        return teams.stream().map(this::mapToTeamResponse).toList();
    }

    public TeamResponse getTeamByShortCode(String shortCode) {
        Team team = teamRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        return mapToTeamResponse(team);
    }

    @Transactional
    public void inviteMember(String teamId, TeamInviteRequest request, String requesterId) {
        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, request.getUserId())) {
            throw new RuntimeException("User is already a member or has a pending association with this team");
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (!team.getLeaderId().equals(requesterId)) {
            throw new RuntimeException("Unauthorized: Only the team leader can invite members.");
        }

        // Constraint: Check team size limit
        Event event = eventRepository.findById(team.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        // Constraint: User must have an APPROVED registration for this event
        Registration registration = registrationRepository.findByEventIdAndUserId(event.getId(), request.getUserId())
                .orElseThrow(() -> new RuntimeException("The user must be registered for this event to be invited."));
        if (registration.getStatus() != RegistrationStatus.APPROVED) {
            throw new RuntimeException("The user's registration must be approved before they can be invited.");
        }

        // Constraint: User can only be in ONE team per event
        if (teamMemberRepository.existsByTeamEventIdAndUserIdAndStatus(event.getId(), request.getUserId(), TeamMemberStatus.ACCEPTED)) {
            throw new RuntimeException("This user is already an accepted member of another team in this event.");
        }

        if (event.getTeamSize() != null) {
            long currentMembers = teamMemberRepository.findByTeamId(teamId).stream()
                    .filter(m -> m.getStatus() == TeamMemberStatus.ACCEPTED || m.getStatus() == TeamMemberStatus.INVITED)
                    .count();
            if (currentMembers >= event.getTeamSize()) {
                throw new RuntimeException("Team has reached its maximum size capacity.");
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
            throw new RuntimeException("You have already requested to join or are already a member of this team");
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // Constraint: Check team size limit
        Event event = eventRepository.findById(team.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        // Constraint: User must have an APPROVED registration for this event
        Registration registration = registrationRepository.findByEventIdAndUserId(event.getId(), request.getUserId())
                .orElseThrow(() -> new RuntimeException("You must be registered for this event to join a team."));
        if (registration.getStatus() != RegistrationStatus.APPROVED) {
            throw new RuntimeException("Your registration for this event must be approved before you can join a team.");
        }

        // Constraint: User can only be in ONE team per event
        if (teamMemberRepository.existsByTeamEventIdAndUserIdAndStatus(event.getId(), request.getUserId(), TeamMemberStatus.ACCEPTED)) {
            throw new RuntimeException("You are already an accepted member of another team in this event.");
        }

        if (event.getTeamSize() != null) {
            long currentMembers = teamMemberRepository.findByTeamId(teamId).stream()
                    .filter(m -> m.getStatus() == TeamMemberStatus.ACCEPTED)
                    .count();
            if (currentMembers >= event.getTeamSize()) {
                throw new RuntimeException("This team is already full.");
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
                .orElseThrow(() -> new RuntimeException("Membership not found"));

        if (accept) {
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new RuntimeException("Team not found"));
            
            // Constraint: User can only be in ONE team per event
            if (teamMemberRepository.existsByTeamEventIdAndUserIdAndStatus(team.getEventId(), userId, TeamMemberStatus.ACCEPTED)) {
                throw new RuntimeException("You are already an accepted member of another team in this event.");
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
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (!team.getLeaderId().equals(leaderId)) {
            throw new RuntimeException("Only leader can dismantle team");
        }

        teamRepository.delete(team);
    }

    @Transactional
    public void transferLeadership(String teamId, String currentLeaderId, String newLeaderId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (!team.getLeaderId().equals(currentLeaderId)) {
            throw new RuntimeException("Only leader can transfer leadership");
        }

        TeamMember currentLeader = teamMemberRepository.findByTeamIdAndUserId(teamId, currentLeaderId)
                .orElseThrow(() -> new RuntimeException("Leader not found"));
        TeamMember nextLeader = teamMemberRepository.findByTeamIdAndUserId(teamId, newLeaderId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

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
                .orElseThrow(() -> new RuntimeException("Membership not found"));

        if (member.getRole() == TeamRole.LEADER) {
            throw new RuntimeException("Leader cannot leave. Dismantle or transfer leadership first.");
        }

        teamMemberRepository.delete(member);
    }

    @Transactional
    public void updateProblemStatement(String teamId, String leaderId, String problemId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (!team.getLeaderId().equals(leaderId)) {
            throw new RuntimeException("Only team leader can select problem statement");
        }

        team.setProblemStatementId(problemId);
        teamRepository.save(team);
    }

    @Transactional
    public void submitProject(String teamId, String userId, TeamSubmissionRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (!team.getLeaderId().equals(userId)) {
            throw new RuntimeException("Only team leader can submit project");
        }

        // Constraint: Check if event is ongoing
        Event event = eventRepository.findById(team.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        if (event.getStatus() != EventStatus.ONGOING) {
            if (java.time.LocalDateTime.now().isBefore(event.getStartDate())) {
                throw new RuntimeException("Submissions haven't opened yet. The event starts on " + event.getStartDate());
            } else {
                throw new RuntimeException("Submissions are closed. The event ended on " + event.getEndDate());
            }
        }

        team.setRepoUrl(request.getRepoUrl());
        team.setSubmissionTime(java.time.LocalDateTime.now());
        teamRepository.save(team);
    }

    public Map<String, Object> getTeamForEvaluation(String teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
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
    public void updateScore(String teamId, Double score, String aiSummary) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        team.setScore(score);
        team.setAiSummary(aiSummary);
        teamRepository.save(team);
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
                    .ifPresent(ps -> map.put("problemStatement", ps.getStatement()));
        }

        return map;
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
}