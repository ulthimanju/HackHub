package com.ehub.ai.service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import com.ehub.ai.queue.EvaluationJob;
import com.ehub.ai.queue.EvaluationQueueService;
import com.ehub.ai.port.AnalyzerPort;
import com.ehub.ai.reporting.EvaluationReportingPort;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

/**
 * Orchestrates the AI evaluation pipeline.
 *
 * The worker only manages the polling loop and retry backoff.
 * Queue semantics, job status updates, and retry bookkeeping live in
 * EvaluationQueueService.
 */
@Service
@Slf4j
public class EvaluationWorker {

    private static final long POLL_TIMEOUT_SECONDS = 5L;
    private static final long INITIAL_BACKOFF_MILLIS = 1_000L;
    private static final long MAX_BACKOFF_MILLIS = 30_000L;

    private final EvaluationQueueService queueService;
    private final EvaluationRunner runner;
    private final EvaluationReportingPort reportingPort;

    private volatile long backoffMillis = INITIAL_BACKOFF_MILLIS;

    public EvaluationWorker(EvaluationQueueService queueService,
            EvaluationRunner runner,
            EvaluationReportingPort reportingPort) {
        this.queueService = queueService;
        this.runner = runner;
        this.reportingPort = reportingPort;
    }

    @PostConstruct
    public void init() {
        Thread worker = new Thread(this::runWorkerLoop, "ai-eval-worker");
        worker.setDaemon(true);
        worker.start();
        log.info("Started background evaluation worker");
    }

    public int queueEvent(String eventId) {
        return queueService.queueEvent(eventId);
    }

    public void queueTeam(String teamId) {
        queueService.queueTeam(teamId);
    }

    public Map<Object, Object> getJobStatus(String teamId) {
        return queueService.getJobStatus(teamId);
    }

    private void runWorkerLoop() {
        while (!Thread.currentThread().isInterrupted()) {
            try {
                Optional<EvaluationJob> maybeJob = queueService.pollJob(POLL_TIMEOUT_SECONDS, TimeUnit.SECONDS);
                if (maybeJob.isEmpty()) {
                    backoffMillis = INITIAL_BACKOFF_MILLIS;
                    continue;
                }

                processJob(maybeJob.get());
                backoffMillis = INITIAL_BACKOFF_MILLIS;
            } catch (Exception e) {
                log.error("Worker loop error", e);
                sleepQuietly(backoffMillis);
                backoffMillis = Math.min(backoffMillis * 2, MAX_BACKOFF_MILLIS);
            }
        }
    }

    private void processJob(EvaluationJob job) {
        try {
            runner.run(job);
        } catch (WorkspaceManager.WorkspaceException e) {
            boolean requeued = queueService.handleFailure(job, "Clone failed: " + e.getMessage(), e.isFatal());
            if (!requeued) {
                reportingPort.reportError(job.teamId(), "Clone failed: " + e.getMessage());
            }
        } catch (AnalyzerPort.AnalysisException e) {
            boolean requeued = queueService.handleFailure(job, "Gemini analysis failed: " + e.getMessage(), false);
            if (!requeued) {
                reportingPort.reportError(job.teamId(), e.getMessage());
            }
        } catch (RuntimeException e) {
            boolean requeued = queueService.handleFailure(job, "Worker error: " + e.getMessage(), false);
            if (!requeued) {
                reportingPort.reportError(job.teamId(), e.getMessage());
            }
        }
    }

    private void sleepQuietly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
