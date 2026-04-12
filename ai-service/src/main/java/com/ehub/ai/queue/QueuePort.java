package com.ehub.ai.queue;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import com.ehub.ai.queue.EvaluationJob;
import com.ehub.ai.queue.JobStatus;

public interface QueuePort {
    void enqueue(EvaluationJob job);

    Optional<EvaluationJob> pop(long timeout, TimeUnit unit);

    void updateStatus(String teamId, JobStatus status, int attempt, String error);

    Map<Object, Object> getStatus(String teamId);
}
