package com.ehub.event.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ehub.event.dto.TeamSubmissionRequest;
import com.ehub.event.entity.Event;
import com.ehub.event.entity.Team;
import com.ehub.event.mapper.TeamMapper;
import com.ehub.event.port.TeamClock;
import com.ehub.event.repository.EventRepository;
import com.ehub.event.repository.ProblemStatementRepository;
import com.ehub.event.repository.TeamRepository;
import com.ehub.event.util.MessageKeys;

@ExtendWith(MockitoExtension.class)
class TeamSubmissionServiceTest {

    @Mock
    private TeamRepository teamRepository;
    @Mock
    private EventRepository eventRepository;
    @Mock
    private ProblemStatementRepository problemStatementRepository;

    private TeamSubmissionService service;

    @BeforeEach
    void setUp() {
        TeamClock fixedClock = () -> LocalDateTime.of(2026, 4, 12, 10, 0, 0);
        service = new TeamSubmissionService(
                teamRepository,
                eventRepository,
                problemStatementRepository,
                new TeamMapper(),
                fixedClock);
    }

    @Test
    void submitProject_rejectsWhenEventNotOngoing() {
        Team team = Team.builder().id("t1").eventId("e1").leaderId("u1").build();
        Event event = Event.builder()
                .id("e1")
                .startDate(LocalDateTime.of(2026, 4, 12, 12, 0, 0))
                .endDate(LocalDateTime.of(2026, 4, 13, 12, 0, 0))
                .registrationStartDate(LocalDateTime.of(2026, 4, 10, 10, 0, 0))
                .registrationEndDate(LocalDateTime.of(2026, 4, 11, 10, 0, 0))
                .judging(true)
                .build();

        when(teamRepository.findById("t1")).thenReturn(Optional.of(team));
        when(eventRepository.findById("e1")).thenReturn(Optional.of(event));

        TeamSubmissionRequest req = new TeamSubmissionRequest();
        req.setRepoUrl("https://example.com/repo");

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> service.submitProject("t1", "u1", req));

        assertEquals(String.format(MessageKeys.SUBMISSIONS_NOT_OPEN.getMessage(), event.getStartDate()),
                ex.getMessage());
        verify(teamRepository, never()).save(team);
    }

    @Test
    void submitProject_updatesRepoAndSubmissionTimeWhenOngoing() {
        Team team = Team.builder().id("t1").eventId("e1").leaderId("u1").score(0.0).build();
        Event event = Event.builder()
                .id("e1")
                .startDate(LocalDateTime.of(2026, 4, 12, 9, 0, 0))
                .endDate(LocalDateTime.of(2026, 4, 12, 18, 0, 0))
                .registrationStartDate(LocalDateTime.of(2026, 4, 10, 10, 0, 0))
                .registrationEndDate(LocalDateTime.of(2026, 4, 11, 10, 0, 0))
                .judging(true)
                .build();

        when(teamRepository.findById("t1")).thenReturn(Optional.of(team));
        when(eventRepository.findById("e1")).thenReturn(Optional.of(event));

        TeamSubmissionRequest req = new TeamSubmissionRequest();
        req.setRepoUrl("https://example.com/repo");
        req.setDemoUrl("https://example.com/demo");

        service.submitProject("t1", "u1", req);

        assertEquals("https://example.com/repo", team.getRepoUrl());
        assertEquals("https://example.com/demo", team.getDemoUrl());
        verify(teamRepository).save(team);
    }
}
