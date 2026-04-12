package com.ehub.event.scheduler;

import com.ehub.event.entity.Event;
import com.ehub.event.repository.EventRepository;
import com.ehub.event.service.MissionNotificationService;
import com.ehub.event.enums.EventStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.*;

@Component
@Slf4j
@RequiredArgsConstructor
public class EventStatusScheduler {

    private final EventRepository eventRepository;
    private final MissionNotificationService missionNotificationService;

    /** Canonical ordering used to decide whether a transition is "forward". */
    private static final List<EventStatus> STATUS_ORDER = List.of(
            EventStatus.UPCOMING,
            EventStatus.REGISTRATION_OPEN,
            EventStatus.ONGOING,
            EventStatus.JUDGING,
            EventStatus.RESULTS_ANNOUNCED,
            EventStatus.COMPLETED);

    @Scheduled(fixedRate = 60000) // Run every minute
    public void checkEventStatusTransitions() {
        List<Event> events = eventRepository.findAll();
        for (Event event : events) {
            EventStatus currentActualStatus = event.calculateCurrentStatus();
            EventStatus lastOfficialStatus = event.getStatus();

            if (lastOfficialStatus == null || lastOfficialStatus != currentActualStatus) {
                // Only advance — never downgrade a status that was manually set ahead
                if (isForwardTransition(lastOfficialStatus, currentActualStatus)) {
                    event.setStatus(currentActualStatus);
                    eventRepository.save(event);
                    handleTransition(event, lastOfficialStatus, currentActualStatus);
                }
            }
        }
    }

    private boolean isForwardTransition(EventStatus from, EventStatus to) {
        if (from == null)
            return true;
        return STATUS_ORDER.indexOf(to) > STATUS_ORDER.indexOf(from);
    }

    private void handleTransition(Event event, EventStatus from, EventStatus to) {
        log.info("Event {} transitioned from {} to {}", event.getName(), from, to);
        missionNotificationService.notifyTransition(event, to);
    }
}
