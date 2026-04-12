package com.ehub.event.scheduler;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.ehub.event.entity.OutboxEvent;
import com.ehub.event.service.OutboxService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class OutboxPublisherScheduler {

    private final OutboxService outboxService;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Value("${application.kafka.enabled:false}")
    private boolean kafkaEnabled;

    @Value("${application.kafka.topics.notifications}")
    private String notificationsTopic;

    @Scheduled(fixedDelayString = "${application.outbox.publish-delay-ms:2000}")
    public void publishPendingEvents() {
        if (!kafkaEnabled) {
            return;
        }

        List<OutboxEvent> pending = outboxService.fetchPendingBatch(100);
        for (OutboxEvent event : pending) {
            try {
                kafkaTemplate.send(notificationsTopic, event.getAggregateId(), event.getPayload()).get();
                outboxService.markPublished(event.getId());
            } catch (Exception ex) {
                outboxService.markFailed(event.getId(), ex);
                log.warn("Failed to publish outbox event {} to Kafka", event.getId(), ex);
            }
        }
    }
}