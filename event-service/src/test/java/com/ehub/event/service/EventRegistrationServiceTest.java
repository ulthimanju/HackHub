package com.ehub.event.service;

import com.ehub.event.dto.RegistrationRequest;
import com.ehub.event.entity.Event;
import com.ehub.event.enums.RegistrationStatus;
import com.ehub.event.port.EventClock;
import com.ehub.event.port.NotificationPort;
import com.ehub.event.repository.EventRepository;
import com.ehub.event.repository.RegistrationRepository;
import com.ehub.event.repository.TeamMemberRepository;
import com.ehub.event.repository.TeamRepository;
import com.ehub.event.util.MessageKeys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventRegistrationServiceTest {

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
    private EventRegistrationService service;

    @BeforeEach
    void setUp() {
        fixedClock = () -> LocalDateTime.of(2026, 4, 12, 10, 0, 0);
        service = new EventRegistrationService(
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
    void registerForEvent_rejectsWhenDeadlinePassed() {
        Event event = Event.builder()
                .id("e1")
                .name("Hack")
                .registrationEndDate(LocalDateTime.of(2026, 4, 11, 23, 59))
                .maxParticipants(10)
                .organizerId("org")
                .build();

        when(registrationRepository.existsByEventIdAndUserId("e1", "u1")).thenReturn(false);
        when(eventRepository.findById("e1")).thenReturn(Optional.of(event));

        RegistrationRequest req = RegistrationRequest.builder().username("u").userEmail("u@x.com").build();

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> service.registerForEvent("e1", req, "u1"));
        assertEquals(MessageKeys.REGISTRATION_CLOSED.getMessage(), ex.getMessage());
        verify(registrationRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void registerForEvent_rejectsWhenCapacityReached() {
        Event event = Event.builder()
                .id("e1")
                .name("Hack")
                .registrationEndDate(LocalDateTime.of(2026, 4, 13, 23, 59))
                .maxParticipants(1)
                .organizerId("org")
                .build();

        com.ehub.event.entity.Registration approved = com.ehub.event.entity.Registration.builder()
                .id("r1")
                .eventId("e1")
                .status(RegistrationStatus.APPROVED)
                .build();

        when(registrationRepository.existsByEventIdAndUserId("e1", "u1")).thenReturn(false);
        when(eventRepository.findById("e1")).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventId("e1")).thenReturn(List.of(approved));

        RegistrationRequest req = RegistrationRequest.builder().username("u").userEmail("u@x.com").build();

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> service.registerForEvent("e1", req, "u1"));
        assertEquals(MessageKeys.EVENT_CAPACITY_REACHED.getMessage(), ex.getMessage());
    }
}
