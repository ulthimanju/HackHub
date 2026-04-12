package com.ehub.ai.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ehub.ai.dto.EvaluationContext;
import com.ehub.ai.exception.EvaluationQueueException;
import com.ehub.ai.model.EvaluationJob;
import com.ehub.ai.model.JobStatus;
import com.ehub.ai.reporting.EvaluationReportingPort;
import com.ehub.ai.port.QueuePort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class EvaluationQueueService {

    private final QueuePort queuePort;
    private final EvaluationReportingPort reportingPort;

    @Value("${application.max-retries:3}")
    private int maxRetries;

    public int queueEvent(String eventId) {
        List<EvaluationContext> contexts = reportingPort.getEventContexts(eventId);
        int count = 0;
        for (EvaluationContext context : contexts) {
            if (context.repoUrl() == null || context.repoUrl().isBlank()) {
                continue;
            }
            queuePort.enqueue(EvaluationJob.of(context));
            count++;
        }
        log.info("Queued {} team(s) for event {}", count, eventId);
        return count;
    }

    public void queueTeam(String teamId) {
        EvaluationContext context = reportingPort.getTeamContext(teamId);
        if (context.repoUrl() == null || context.repoUrl().isBlank()) {
            throw new EvaluationQueueException("Team " + teamId + " has no repository URL.");
        }
        queuePort.enqueue(EvaluationJob.of(context));
        log.info("Queued team {} for evaluation", teamId);
    }

    public Optional<EvaluationJob> pollJob(long timeout, TimeUnit unit) {
        return queuePort.pop(timeout, unit);
    }

    public Map<Object, Object> getJobStatus(String teamId) {
        Map<Object, Object> status = queuePort.getStatus(teamId);
        if (status == null || status.isEmpty()) {
            return Map.of("status", "NOT_FOUND");
        }
        return status;
    }

    public void updateStatus(String teamId, JobStatus status, int attempt, String error) {
        queuePort.updateStatus(teamId, status, attempt, error);
    }

    public boolean handleFailure(EvaluationJob job, String reason, boolean fatal) {
        if (!fatal && job.retryCount() < maxRetries) {
            log.info("Re-queuing team {} (retry {})", job.teamId(), job.retryCount() + 1);
            queuePort.enqueue(job.incrementRetry());
            return true;
        }

        log.error("Team {} permanently failed: {}", job.teamId(), reason);
        queuePort.updateStatus(job.teamId(), JobStatus.FAILED, job.retryCount() + 1, reason);
        return false;
    }
}
