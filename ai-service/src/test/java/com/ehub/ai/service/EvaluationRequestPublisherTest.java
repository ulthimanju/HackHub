package com.ehub.ai.service;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class EvaluationRequestPublisherTest {

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    private EvaluationRequestPublisher publisher;

    @BeforeEach
    void setUp() {
        publisher = new EvaluationRequestPublisher(kafkaTemplate, new ObjectMapper());
        ReflectionTestUtils.setField(publisher, "kafkaEnabled", true);
        ReflectionTestUtils.setField(publisher, "topic", "ai.eval.requests.v1");
    }

    @Test
    void publishEvent_sendsKafkaMessage() {
        publisher.publishEvent("event-1");

        verify(kafkaTemplate).send(anyString(), anyString(), anyString());
    }
}