package com.ehub.ai.queue;

import com.ehub.ai.run.EvaluationContext;

/**
 * Represents a single evaluation job moving through the pipeline.
 * Stored as JSON in the Redis queue and as a Hash for status tracking.
 */
public record EvaluationJob(
        String teamId,
        EvaluationContext context,
        JobStatus status,
        int retryCount,
        String errorMessage,
        long enqueuedAt
) {
    public EvaluationJob withStatus(JobStatus newStatus) {
        return new EvaluationJob(teamId, context, newStatus, retryCount, errorMessage, enqueuedAt);
    }

    public EvaluationJob withError(String error) {
        return new EvaluationJob(teamId, context, JobStatus.FAILED, retryCount, error, enqueuedAt);
    }

    public EvaluationJob incrementRetry() {
        return new EvaluationJob(teamId, context, JobStatus.QUEUED, retryCount + 1, errorMessage, enqueuedAt);
    }

    public static EvaluationJob of(EvaluationContext ctx) {
        return new EvaluationJob(ctx.teamId(), ctx, JobStatus.QUEUED, 0, null, System.currentTimeMillis());
    }
}
