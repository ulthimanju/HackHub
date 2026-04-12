package com.ehub.ai.service;

import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ehub.ai.dto.EvaluationContext;
import com.ehub.ai.queue.EvaluationJob;
import com.ehub.ai.queue.EvaluationQueueService;
import com.ehub.ai.model.GeminiResult;
import com.ehub.ai.queue.JobStatus;
import com.ehub.ai.port.AnalyzerPort;
import com.ehub.ai.reporting.EvaluationReportingPort;
import com.ehub.ai.port.PromptLoader;

@ExtendWith(MockitoExtension.class)
class EvaluationRunnerTest {

    @Mock
    private EvaluationQueueService queueService;
    @Mock
    private WorkspaceManager workspaceManager;
    @Mock
    private AnalyzerPort analyzerPort;
    @Mock
    private EvaluationReportingPort reportingPort;
    @Mock
    private PromptLoader promptLoader;

    private EvaluationRunner runner;

    @BeforeEach
    void setUp() {
        runner = new EvaluationRunner(queueService, workspaceManager, analyzerPort, reportingPort, promptLoader);
    }

    @Test
    void run_updatesStatusesAndReportsSuccess() throws Exception {
        EvaluationContext context = new EvaluationContext("t1", "Team One", "https://github.com/x/y", "problem", "req",
                "theme");
        EvaluationJob job = new EvaluationJob("t1", context, JobStatus.QUEUED, 1, null, 1L);
        GeminiResult result = new GeminiResult(88.0, "solid implementation");

        when(workspaceManager.cloneRepo("https://github.com/x/y", "t1")).thenReturn("C:/workspace/t1");
        when(promptLoader.buildJudgePrompt(context)).thenReturn("prompt");
        when(analyzerPort.analyze("t1", "prompt")).thenReturn(result);

        runner.run(job);

        InOrder order = inOrder(queueService, workspaceManager, promptLoader, analyzerPort, reportingPort);
        order.verify(queueService).updateStatus("t1", JobStatus.CLONING, 2, null);
        order.verify(workspaceManager).cloneRepo("https://github.com/x/y", "t1");
        order.verify(queueService).updateStatus("t1", JobStatus.ANALYZING, 2, null);
        order.verify(promptLoader).buildJudgePrompt(context);
        order.verify(analyzerPort).analyze("t1", "prompt");
        order.verify(queueService).updateStatus("t1", JobStatus.COMPLETED, 2, null);
        order.verify(reportingPort).reportSuccess("t1", result);
        verify(workspaceManager).cleanup("t1");
    }
}
