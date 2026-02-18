package com.ehub.event.scheduler;

import com.ehub.event.entity.Event;
import com.ehub.event.repository.EventRepository;
import com.ehub.event.service.MissionNotificationService;
import com.ehub.common.enums.EventStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.*;

@Component
@RequiredArgsConstructor
public class EventStatusScheduler {

    private final EventRepository eventRepository;
    private final MissionNotificationService missionNotificationService;

    @Scheduled(fixedRate = 60000) // Run every minute
    public void checkEventStatusTransitions() {
        List<Event> events = eventRepository.findAll();
        for (Event event : events) {
            EventStatus currentActualStatus = event.calculateCurrentStatus();
            EventStatus lastOfficialStatus = event.getStatus();

            if (lastOfficialStatus == null || lastOfficialStatus != currentActualStatus) {
                event.setStatus(currentActualStatus);
                eventRepository.save(event);
                
                // Trigger transition actions
                handleTransition(event, lastOfficialStatus, currentActualStatus);
            }
        }
    }

    private void handleTransition(Event event, EventStatus from, EventStatus to) {
        System.out.println("Event " + event.getName() + " transitioned from " + from + " to " + to);
        missionNotificationService.notifyTransition(event, to);
    }
}
