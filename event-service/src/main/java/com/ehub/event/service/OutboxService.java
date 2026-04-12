package com.ehub.event.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ehub.event.entity.OutboxEvent;
import com.ehub.event.enums.OutboxStatus;
import com.ehub.event.repository.OutboxEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OutboxService {

    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    @Value("${application.outbox.max-attempts:5}")
    private int maxAttempts;

    @Transactional
    public void enqueue(String aggregateType, String aggregateId, String eventType, Map<String, Object> payload) {
        String serializedPayload = toJson(payload);

        OutboxEvent event = OutboxEvent.builder()
                .id(UUID.randomUUID().toString())
                .aggregateType(aggregateType)
                .aggregateId(aggregateId)
                .eventType(eventType)
                .payload(serializedPayload)
                .build();

        outboxEventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<OutboxEvent> fetchPendingBatch(int batchSize) {
        return outboxEventRepository.findTop100ByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING)
                .stream()
                .limit(batchSize)
                .toList();
    }

    @Transactional
    public void markPublished(String id) {
        outboxEventRepository.findById(id).ifPresent(event -> {
            event.setStatus(OutboxStatus.PUBLISHED);
            event.setPublishedAt(LocalDateTime.now());
            event.setError(null);
            outboxEventRepository.save(event);
        });
    }

    @Transactional
    public void markFailed(String id, Exception ex) {
        outboxEventRepository.findById(id).ifPresent(event -> {
            int attempts = event.getAttempts() + 1;
            event.setAttempts(attempts);
            event.setStatus(attempts >= Math.max(maxAttempts, 1) ? OutboxStatus.FAILED : OutboxStatus.PENDING);
            event.setError(ex.getMessage());
            outboxEventRepository.save(event);
        });
    }

    private String toJson(Map<String, Object> payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to serialize outbox payload", ex);
        }
    }
}