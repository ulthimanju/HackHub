package com.ehub.ai.run;

import org.springframework.stereotype.Service;

import com.ehub.ai.queue.EvaluationJob;
import com.ehub.ai.queue.EvaluationQueueService;
import com.ehub.ai.run.GeminiResult;
import com.ehub.ai.queue.JobStatus;
import com.ehub.ai.run.AnalyzerPort;
import com.ehub.ai.reporting.EvaluationReportingPort;
import com.ehub.ai.run.PromptLoader;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EvaluationRunner {

    private final EvaluationQueueService queueService;
    private final WorkspaceManager workspaceManager;
    private final AnalyzerPort analyzerPort;
    private final EvaluationReportingPort reportingPort;
    private final PromptLoader promptLoader;

    public void run(EvaluationJob job) throws com.ehub.ai.run.WorkspaceManager.WorkspaceException, AnalyzerPort.AnalysisException {
        String teamId = job.teamId();
        int attempt = job.retryCount() + 1;

        queueService.updateStatus(teamId, JobStatus.CLONING, attempt, null);
        try {
            workspaceManager.cloneRepo(job.context().repoUrl(), teamId);
            queueService.updateStatus(teamId, JobStatus.ANALYZING, attempt, null);

            String prompt = promptLoader.buildJudgePrompt(job.context());
            GeminiResult result = analyzerPort.analyze(teamId, prompt);

            queueService.updateStatus(teamId, JobStatus.COMPLETED, attempt, null);
            reportingPort.reportSuccess(teamId, result);
            System.out.printf("[EvaluationRunner] ✓ Team %s scored %.1f%n", job.context().teamName(), result.score());
        } finally {
            workspaceManager.cleanup(teamId);
        }
    }
}
