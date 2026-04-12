package com.ehub.ai.consumer;

import static org.mockito.Mockito.verify;

import com.ehub.ai.dto.EvaluationRequestMessage;
import com.ehub.ai.service.EvaluationQueueService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EvaluationRequestConsumerTest {

    @Mock
    private EvaluationQueueService queueService;

    private EvaluationRequestConsumer consumer;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        consumer = new EvaluationRequestConsumer(objectMapper, queueService);
    }

    @Test
    void consume_eventRequestRoutesToQueueEvent() throws Exception {
        String payload = objectMapper.writeValueAsString(EvaluationRequestMessage.forEvent("event-1"));

        consumer.consume(payload);

        verify(queueService).queueEvent("event-1");
    }

    @Test
    void consume_teamRequestRoutesToQueueTeam() throws Exception {
        String payload = objectMapper.writeValueAsString(EvaluationRequestMessage.forTeam("team-1"));

        consumer.consume(payload);

        verify(queueService).queueTeam("team-1");
    }
}