package com.ehub.ai.port;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import com.ehub.ai.model.EvaluationJob;
import com.ehub.ai.model.JobStatus;

public interface QueuePort {
    void enqueue(EvaluationJob job);

    Optional<EvaluationJob> pop(long timeout, TimeUnit unit);

    void updateStatus(String teamId, JobStatus status, int attempt, String error);

    Map<Object, Object> getStatus(String teamId);
}
