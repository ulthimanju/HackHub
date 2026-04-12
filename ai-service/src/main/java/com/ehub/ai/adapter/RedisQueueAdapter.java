package com.ehub.ai.adapter;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;

import com.ehub.ai.exception.EvaluationQueueException;
import com.ehub.ai.model.EvaluationJob;
import com.ehub.ai.model.JobStatus;
import com.ehub.ai.port.QueuePort;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class RedisQueueAdapter implements QueuePort {

    private static final int JOB_TTL_HOURS = 48;

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${application.ai-queue-key:ehub:ai:evaluation:queue}")
    private String queueKey;

    @Value("${application.ai-job-key-prefix:ehub:ai:job:}")
    private String jobKeyPrefix;

    @Override
    public void enqueue(EvaluationJob job) {
        try {
            redisTemplate.opsForList().leftPush(queueKey, job);
            updateStatus(job.teamId(), JobStatus.QUEUED, job.retryCount(), null);
        } catch (Exception e) {
            throw new EvaluationQueueException("Failed to enqueue team " + job.teamId() + ": " + e.getMessage());
        }
    }

    @Override
    public Optional<EvaluationJob> pop(long timeout, TimeUnit unit) {
        try {
            Object raw = redisTemplate.opsForList().rightPop(queueKey, timeout, unit);
            if (raw == null) {
                return Optional.empty();
            }
            if (raw instanceof EvaluationJob job) {
                return Optional.of(job);
            }
            return Optional.of(objectMapper.convertValue(raw, EvaluationJob.class));
        } catch (Exception e) {
            throw new EvaluationQueueException("Failed to pop evaluation job: " + e.getMessage());
        }
    }

    @Override
    public void updateStatus(String teamId, JobStatus status, int attempt, String error) {
        try {
            Map<String, Object> fields = new HashMap<>();
            fields.put("status", status.name());
            fields.put("attempt", String.valueOf(attempt));
            fields.put("updatedAt", String.valueOf(System.currentTimeMillis()));
            if (error != null) {
                fields.put("error", error.length() > 500 ? error.substring(0, 500) + "…" : error);
            }
            String key = jobKeyPrefix + teamId;
            redisTemplate.opsForHash().putAll(key, fields);
            redisTemplate.expire(key, JOB_TTL_HOURS, TimeUnit.HOURS);
        } catch (Exception e) {
            throw new EvaluationQueueException("Failed to update status for team " + teamId + ": " + e.getMessage());
        }
    }

    @Override
    public Map<Object, Object> getStatus(String teamId) {
        return redisTemplate.opsForHash().entries(jobKeyPrefix + teamId);
    }
}
