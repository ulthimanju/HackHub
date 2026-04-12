package com.ehub.ai.consumer;

import com.ehub.ai.dto.EvaluationRequestMessage;
import com.ehub.ai.service.EvaluationQueueService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(name = "application.kafka.consumer-enabled", havingValue = "true")
public class EvaluationRequestConsumer {

    private final ObjectMapper objectMapper;
    private final EvaluationQueueService queueService;

    @KafkaListener(topics = "${application.kafka.topic:ai.eval.requests.v1}", groupId = "ai-service-eval-v1")
    public void consume(String payload) {
        EvaluationRequestMessage request = deserialize(payload);
        if (request.getEventId() != null && !request.getEventId().isBlank()) {
            queueService.queueEvent(request.getEventId());
            return;
        }
        if (request.getTeamId() != null && !request.getTeamId().isBlank()) {
            queueService.queueTeam(request.getTeamId());
            return;
        }

        log.warn("Discarded AI evaluation request with no eventId/teamId");
    }

    private EvaluationRequestMessage deserialize(String payload) {
        try {
            return objectMapper.readValue(payload, EvaluationRequestMessage.class);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid AI evaluation request payload", ex);
        }
    }
}