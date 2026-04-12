package com.ehub.event.service;

import com.ehub.event.dto.EventStatsResponse;
import com.ehub.event.shared.entity.Event;
import com.ehub.event.shared.mapper.EventMapper;
import com.ehub.event.shared.port.EventClock;
import com.ehub.event.shared.repository.EventRepository;
import com.ehub.event.shared.repository.RegistrationRepository;
import com.ehub.event.shared.repository.TeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventQueryServiceTest {

    @Mock
    private EventRepository eventRepository;
    @Mock
    private RegistrationRepository registrationRepository;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private LifecycleService lifecycleService;

    private EventQueryService service;

    @BeforeEach
    void setUp() {
        EventClock fixedClock = () -> LocalDateTime.of(2026, 4, 12, 10, 0, 0);
        EventMapper mapper = new EventMapper(fixedClock);
        service = new EventQueryService(eventRepository, registrationRepository, teamRepository, lifecycleService,
                mapper);
    }

    @Test
    void getEventStats_mapsRepositoryAggregates() {
        Event event = Event.builder().id("e1").organizerId("org").name("Hack").build();

        when(eventRepository.findById("e1")).thenReturn(Optional.of(event));
        when(registrationRepository.countByEventId("e1")).thenReturn(10L);
        when(registrationRepository.countByEventIdAndStatus("e1", com.ehub.event.shared.enums.RegistrationStatus.PENDING))
                .thenReturn(4L);
        when(registrationRepository.countByEventIdAndStatus("e1", com.ehub.event.shared.enums.RegistrationStatus.APPROVED))
                .thenReturn(5L);
        when(registrationRepository.countByEventIdAndStatus("e1", com.ehub.event.shared.enums.RegistrationStatus.REJECTED))
                .thenReturn(1L);
        when(teamRepository.countByEventId("e1")).thenReturn(3L);
        when(teamRepository.countByEventIdAndRepoUrlIsNotNull("e1")).thenReturn(2L);
        when(teamRepository.countByEventIdAndScoreIsNotNull("e1")).thenReturn(2L);
        when(teamRepository.avgScoreByEventId("e1")).thenReturn(82.5);
        when(teamRepository.maxScoreByEventId("e1")).thenReturn(95.0);

        EventStatsResponse stats = service.getEventStats("e1");

        assertEquals(10L, stats.getTotalRegistrations());
        assertEquals(4L, stats.getPendingRegistrations());
        assertEquals(5L, stats.getApprovedRegistrations());
        assertEquals(1L, stats.getRejectedRegistrations());
        assertEquals(3L, stats.getTotalTeams());
        assertEquals(2L, stats.getSubmittedTeams());
        assertEquals(2L, stats.getEvaluatedTeams());
        assertEquals(82.5, stats.getAvgScore());
        assertEquals(95.0, stats.getMaxScore());
    }
}
