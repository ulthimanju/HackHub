package com.ehub.event.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ehub.event.dto.TeamCreateRequest;
import com.ehub.event.dto.TeamInviteRequest;
import com.ehub.event.entity.Event;
import com.ehub.event.entity.Registration;
import com.ehub.event.entity.Team;
import com.ehub.event.entity.TeamMember;
import com.ehub.event.enums.EventStatus;
import com.ehub.event.enums.RegistrationStatus;
import com.ehub.event.enums.TeamMemberStatus;
import com.ehub.event.port.NotificationPort;
import com.ehub.event.port.TeamClock;
import com.ehub.event.repository.EventRepository;
import com.ehub.event.repository.RegistrationRepository;
import com.ehub.event.repository.TeamMemberRepository;
import com.ehub.event.repository.TeamRepository;
import com.ehub.event.util.MessageKeys;

@ExtendWith(MockitoExtension.class)
class TeamRosterServiceTest {

    @Mock
    private TeamRepository teamRepository;
    @Mock
    private TeamMemberRepository teamMemberRepository;
    @Mock
    private RegistrationRepository registrationRepository;
    @Mock
    private EventRepository eventRepository;
    @Mock
    private NotificationPort notificationPort;

    private TeamClock fixedClock;
    private TeamRosterService service;

    @BeforeEach
    void setUp() {
        fixedClock = () -> LocalDateTime.of(2026, 4, 12, 10, 0, 0);
        service = new TeamRosterService(
                teamRepository,
                teamMemberRepository,
                registrationRepository,
                eventRepository,
                notificationPort,
                fixedClock);
    }

    @Test
    void createTeam_rejectsWhenUserAlreadyInAcceptedTeamForEvent() {
        Event event = Event.builder().id("e1").build();
        Registration approved = Registration.builder().status(RegistrationStatus.APPROVED).build();

        when(eventRepository.findById("e1")).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventIdAndUserId("e1", "u1")).thenReturn(Optional.of(approved));
        when(teamMemberRepository.existsByTeamEventIdAndUserIdAndStatus("e1", "u1", TeamMemberStatus.ACCEPTED))
                .thenReturn(true);

        TeamCreateRequest req = new TeamCreateRequest();
        req.setName("Ninjas");

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> service.createTeam("e1", req, "u1"));

        assertEquals(MessageKeys.ALREADY_IN_TEAM_THIS_EVENT.getMessage(), ex.getMessage());
        verify(teamRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void inviteMember_rejectsWhenTeamAtCapacity() {
        Team team = Team.builder().id("t1").eventId("e1").leaderId("leader").name("Ninjas").build();
        Event event = Event.builder().id("e1").name("Hack").teamSize(2).status(EventStatus.UPCOMING).build();
        Registration approved = Registration.builder().status(RegistrationStatus.APPROVED).build();

        TeamMember m1 = TeamMember.builder().status(TeamMemberStatus.ACCEPTED).build();
        TeamMember m2 = TeamMember.builder().status(TeamMemberStatus.INVITED).build();

        when(teamMemberRepository.existsByTeamIdAndUserId("t1", "u2")).thenReturn(false);
        when(teamRepository.findById("t1")).thenReturn(Optional.of(team));
        when(eventRepository.findById("e1")).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventIdAndUserId("e1", "u2")).thenReturn(Optional.of(approved));
        when(teamMemberRepository.existsByTeamEventIdAndUserIdAndStatus("e1", "u2", TeamMemberStatus.ACCEPTED))
                .thenReturn(false);
        when(teamMemberRepository.findByTeamId("t1")).thenReturn(List.of(m1, m2));

        TeamInviteRequest request = new TeamInviteRequest();
        request.setUserId("u2");
        request.setUserEmail("u2@example.com");
        request.setUsername("user2");

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> service.inviteMember("t1", request, "leader"));

        assertEquals(MessageKeys.TEAM_AT_MAX_CAPACITY.getMessage(), ex.getMessage());
        verify(teamMemberRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
