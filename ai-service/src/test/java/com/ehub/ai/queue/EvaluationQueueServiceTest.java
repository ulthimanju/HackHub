package com.ehub.ai.queue;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.ehub.ai.reporting.EvaluationReportingPort;
import com.ehub.ai.run.EvaluationContext;

@ExtendWith(MockitoExtension.class)
class EvaluationQueueServiceTest {

    @Mock
    private QueuePort queuePort;
    @Mock
    private EvaluationReportingPort reportingPort;

    private EvaluationQueueService service;

    @BeforeEach
    void setUp() {
        service = new EvaluationQueueService(queuePort, reportingPort);
        ReflectionTestUtils.setField(service, "maxRetries", 2);
    }

    @Test
    void queueEvent_skipsBlankRepositoriesAndEnqueuesValidTeams() {
        EvaluationContext valid = new EvaluationContext("t1", "Team One", "https://github.com/x/y", "p", "r", "theme");
        EvaluationContext blank = new EvaluationContext("t2", "Team Two", "", "p", "r", "theme");
        when(reportingPort.getEventContexts("e1")).thenReturn(List.of(valid, blank));

        int queued = service.queueEvent("e1");

        assertEquals(1, queued);
        verify(queuePort).enqueue(any(EvaluationJob.class));
    }

    @Test
    void handleFailure_requeuesUntilRetryLimit() {
        EvaluationJob job = new EvaluationJob("t1",
                new EvaluationContext("t1", "Team One", "https://github.com/x/y", "p", "r", "theme"), JobStatus.QUEUED,
                0, null, 1L);

        boolean requeued = service.handleFailure(job, "transient", false);

        assertTrue(requeued);
        ArgumentCaptor<EvaluationJob> captor = ArgumentCaptor.forClass(EvaluationJob.class);
        verify(queuePort).enqueue(captor.capture());
        assertEquals(1, captor.getValue().retryCount());
        verify(queuePort, never()).updateStatus("t1", JobStatus.FAILED, 1, "transient");
    }

    @Test
    void handleFailure_marksFailedAfterRetryLimit() {
        EvaluationJob job = new EvaluationJob("t1",
                new EvaluationContext("t1", "Team One", "https://github.com/x/y", "p", "r", "theme"), JobStatus.QUEUED,
                2, null, 1L);

        boolean requeued = service.handleFailure(job, "final", false);

        assertFalse(requeued);
        verify(queuePort).updateStatus("t1", JobStatus.FAILED, 3, "final");
        verify(queuePort, never()).enqueue(any(EvaluationJob.class));
    }
}
