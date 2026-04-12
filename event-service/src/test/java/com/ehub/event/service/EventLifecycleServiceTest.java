package com.ehub.event.service;

import com.ehub.event.shared.entity.Event;
import com.ehub.event.shared.entity.Registration;
import com.ehub.event.shared.enums.EventStatus;
import com.ehub.event.shared.enums.RegistrationStatus;
import com.ehub.event.shared.port.EventClock;
import com.ehub.event.shared.port.NotificationPort;
import com.ehub.event.shared.repository.EventRepository;
import com.ehub.event.shared.repository.RegistrationRepository;
import com.ehub.event.shared.repository.TeamMemberRepository;
import com.ehub.event.shared.repository.TeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventLifecycleServiceTest {

    @Mock
    private EventRepository eventRepository;
    @Mock
    private RegistrationRepository registrationRepository;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private TeamMemberRepository teamMemberRepository;
    @Mock
    private NotificationPort notificationPort;
    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    private EventClock fixedClock;
    private EventLifecycleService service;

    @BeforeEach
    void setUp() {
        fixedClock = () -> LocalDateTime.of(2026, 4, 12, 10, 0, 0);
        service = new EventLifecycleService(
                eventRepository,
                registrationRepository,
                teamRepository,
                teamMemberRepository,
                notificationPort,
                redisTemplate,
                fixedClock
        );
    }

    @Test
    void advanceStatus_upcoming_setsRegistrationWindow() {
        Event event = Event.builder()
                .id("e1")
                .name("Hack Day")
                .organizerId("org-1")
                .status(EventStatus.UPCOMING)
                .build();

        when(eventRepository.findById("e1")).thenReturn(Optional.of(event));

        EventStatus status = service.advanceEventStatus("e1", "org-1");

        assertEquals(EventStatus.REGISTRATION_OPEN, status);
        assertNotNull(event.getRegistrationStartDate());
        assertNotNull(event.getRegistrationEndDate());
        verify(eventRepository).save(event);
    }

    @Test
    void advanceStatus_judging_announcesResultsAndNotifies() {
        Event event = Event.builder()
                .id("e1")
                .name("Hack Day")
                .organizerId("org-1")
                .status(EventStatus.JUDGING)
                .build();

        Registration approved = Registration.builder()
                .id("r1")
                .eventId("e1")
                .userId("u1")
                .username("alice")
                .userEmail("alice@example.com")
                .status(RegistrationStatus.APPROVED)
                .build();

        when(eventRepository.findById("e1")).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventId("e1")).thenReturn(List.of(approved));

        EventStatus status = service.advanceEventStatus("e1", "org-1");

        assertEquals(EventStatus.RESULTS_ANNOUNCED, status);
        verify(redisTemplate).convertAndSend(anyString(), any());
        ArgumentCaptor<String> subject = ArgumentCaptor.forClass(String.class);
        verify(notificationPort).sendEmail(anyString(), subject.capture(), anyString());
        assertEquals("Results Announced: Hack Day", subject.getValue());
    }
}
