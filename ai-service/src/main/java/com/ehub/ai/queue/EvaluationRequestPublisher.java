package com.ehub.ai.queue;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.ehub.ai.queue.EvaluationRequestMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class EvaluationRequestPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${application.kafka.enabled:false}")
    private boolean kafkaEnabled;

    @Value("${application.kafka.topic:ai.eval.requests.v1}")
    private String topic;

    public boolean isEnabled() {
        return kafkaEnabled;
    }

    public void publishEvent(String eventId) {
        publish(EvaluationRequestMessage.forEvent(eventId), eventId);
    }

    public void publishTeam(String teamId) {
        publish(EvaluationRequestMessage.forTeam(teamId), teamId);
    }

    private void publish(EvaluationRequestMessage message, String key) {
        if (!kafkaEnabled) {
            throw new IllegalStateException("Kafka evaluation publishing is disabled");
        }

        try {
            kafkaTemplate.send(topic, key, objectMapper.writeValueAsString(message));
            log.info("Published AI evaluation request {} to {}", key, topic);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to serialize AI evaluation request", ex);
        }
    }
}