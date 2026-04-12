package com.ehub.event.service;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ehub.event.dto.EventResponse;
import com.ehub.event.dto.EventStatsResponse;
import com.ehub.event.dto.LifecycleResponse;
import com.ehub.event.dto.RegistrationResponse;
import com.ehub.event.entity.Event;
import com.ehub.event.entity.Registration;
import com.ehub.event.enums.RegistrationStatus;
import com.ehub.event.exception.ResourceNotFoundException;
import com.ehub.event.mapper.EventMapper;
import com.ehub.event.repository.EventRepository;
import com.ehub.event.repository.RegistrationRepository;
import com.ehub.event.repository.TeamRepository;
import com.ehub.event.util.MessageKeys;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EventQueryService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final TeamRepository teamRepository;
    private final LifecycleService lifecycleService;
    private final EventMapper eventMapper;

    public List<EventResponse> getEventsByOrganizer(String organizerId) {
        List<Event> events = eventRepository.findByOrganizerId(organizerId);
        Map<String, Long> counts = registrationRepository.countApprovedByEventIds(
                events.stream().map(Event::getId).toList());
        return events.stream().map(e -> eventMapper.toEventResponse(e, counts)).toList();
    }

    public EventStatsResponse getEventStats(String eventId) {
        eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        return EventStatsResponse.builder()
                .totalRegistrations(registrationRepository.countByEventId(eventId))
                .pendingRegistrations(
                        registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.PENDING))
                .approvedRegistrations(
                        registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.APPROVED))
                .rejectedRegistrations(
                        registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.REJECTED))
                .totalTeams(teamRepository.countByEventId(eventId))
                .submittedTeams(teamRepository.countByEventIdAndRepoUrlIsNotNull(eventId))
                .evaluatedTeams(teamRepository.countByEventIdAndScoreIsNotNull(eventId))
                .avgScore(teamRepository.avgScoreByEventId(eventId))
                .maxScore(teamRepository.maxScoreByEventId(eventId))
                .build();
    }

    public List<EventResponse> getEventsByParticipant(String userId) {
        List<String> eventIds = registrationRepository.findByUserId(userId).stream()
                .map(Registration::getEventId).toList();
        List<Event> events = eventRepository.findAllById(eventIds);
        Map<String, Long> counts = registrationRepository.countApprovedByEventIds(eventIds);
        return events.stream().map(e -> eventMapper.toEventResponse(e, counts)).toList();
    }

    public List<EventResponse> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        Map<String, Long> counts = registrationRepository.countApprovedByEventIds(
                events.stream().map(Event::getId).toList());
        return events.stream().map(e -> eventMapper.toEventResponse(e, counts)).toList();
    }

    public Page<EventResponse> getAllEvents(Pageable pageable) {
        Page<Event> page = eventRepository.findAll(pageable);
        List<String> ids = page.getContent().stream().map(Event::getId).toList();
        Map<String, Long> counts = ids.isEmpty() ? Collections.emptyMap()
                : registrationRepository.countApprovedByEventIds(ids);
        List<EventResponse> content = page.getContent().stream().map(e -> eventMapper.toEventResponse(e, counts))
                .toList();
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    public Page<EventResponse> getEventsByOrganizer(String organizerId, Pageable pageable) {
        Page<Event> page = eventRepository.findByOrganizerId(organizerId, pageable);
        List<String> ids = page.getContent().stream().map(Event::getId).toList();
        Map<String, Long> counts = ids.isEmpty() ? Collections.emptyMap()
                : registrationRepository.countApprovedByEventIds(ids);
        List<EventResponse> content = page.getContent().stream().map(e -> eventMapper.toEventResponse(e, counts))
                .toList();
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    public Page<EventResponse> getEventsByParticipant(String userId, Pageable pageable) {
        List<String> eventIds = registrationRepository.findByUserId(userId).stream()
                .map(Registration::getEventId).toList();
        if (eventIds.isEmpty()) {
            return Page.empty(pageable);
        }
        List<Event> all = eventRepository.findAllById(eventIds);
        Map<String, Long> counts = registrationRepository.countApprovedByEventIds(eventIds);
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), all.size());
        if (start > all.size()) {
            return Page.empty(pageable);
        }
        List<EventResponse> content = all.subList(start, end).stream()
                .map(e -> eventMapper.toEventResponse(e, counts)).toList();
        return new PageImpl<>(content, pageable, all.size());
    }

    public Page<RegistrationResponse> getEventRegistrations(String eventId, Pageable pageable) {
        return registrationRepository.findByEventId(eventId, pageable).map(eventMapper::toRegistrationResponse);
    }

    public List<RegistrationResponse> getEventRegistrations(String eventId) {
        return eventMapper.toRegistrationResponses(registrationRepository.findByEventId(eventId));
    }

    public List<RegistrationResponse> getMyRegistrations(String userId) {
        return eventMapper.toRegistrationResponses(registrationRepository.findByUserId(userId));
    }

    public EventResponse getEventById(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        long count = registrationRepository.countByEventIdAndStatus(id, RegistrationStatus.APPROVED);
        return eventMapper.toEventResponse(event, Map.of(id, count));
    }

    public Map.Entry<String, LifecycleResponse> getEventLifecycleData(String id, String role) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        return Map.entry(lifecycleService.computeEtag(event), lifecycleService.build(event, role));
    }

    public EventResponse getEventByShortCode(String shortCode) {
        Event event = eventRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        long count = registrationRepository.countByEventIdAndStatus(event.getId(), RegistrationStatus.APPROVED);
        return eventMapper.toEventResponse(event, Map.of(event.getId(), count));
    }
}
