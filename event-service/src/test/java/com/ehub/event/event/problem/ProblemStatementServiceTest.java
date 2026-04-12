package com.ehub.event.event.problem;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ehub.event.event.problem.ProblemStatementRequest;
import com.ehub.event.shared.entity.Event;
import com.ehub.event.shared.entity.ProblemStatement;
import com.ehub.event.shared.enums.EventStatus;
import com.ehub.event.shared.repository.EventRepository;
import com.ehub.event.shared.repository.ProblemStatementRepository;
import com.ehub.event.util.MessageKeys;

@ExtendWith(MockitoExtension.class)
class ProblemStatementServiceTest {

    @Mock
    private EventRepository eventRepository;
    @Mock
    private ProblemStatementRepository problemRepository;

    private ProblemStatementService service;

    @BeforeEach
    void setUp() {
        service = new ProblemStatementService(eventRepository, problemRepository);
    }

    @Test
    void updateProblemStatement_blocksWhenEventStarted() {
        Event event = Event.builder()
                .id("e1")
                .organizerId("org-1")
                .status(EventStatus.ONGOING)
                .build();

        ProblemStatement ps = ProblemStatement.builder()
                .id("p1")
                .event(event)
                .build();

        when(problemRepository.findById("p1")).thenReturn(Optional.of(ps));

        ProblemStatementRequest req = new ProblemStatementRequest();
        req.setName("n");
        req.setStatement("s");
        req.setRequirements("r");

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> service.updateProblemStatement("p1", req, "org-1"));
        assertEquals(MessageKeys.PROBLEM_STATEMENTS_LOCKED.getMessage(), ex.getMessage());
        verify(problemRepository, never()).save(ps);
    }

    @Test
    void deleteProblemStatement_blocksOutsideRegistrationPhase() {
        Event event = Event.builder()
                .id("e1")
                .organizerId("org-1")
                .status(EventStatus.JUDGING)
                .build();

        ProblemStatement ps = ProblemStatement.builder()
                .id("p1")
                .event(event)
                .build();

        when(problemRepository.findById("p1")).thenReturn(Optional.of(ps));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> service.deleteProblemStatement("p1", "org-1"));
        assertEquals(MessageKeys.PROBLEM_STATEMENTS_LOCKED.getMessage(), ex.getMessage());
        verify(problemRepository, never()).deleteById("p1");
    }
}
