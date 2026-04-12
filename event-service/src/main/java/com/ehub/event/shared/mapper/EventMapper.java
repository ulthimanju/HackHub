package com.ehub.event.shared.mapper;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.ehub.event.dto.EventResponse;
import com.ehub.event.event.registration.RegistrationResponse;
import com.ehub.event.shared.entity.Event;
import com.ehub.event.shared.entity.ProblemStatement;
import com.ehub.event.shared.entity.Registration;
import com.ehub.event.shared.port.EventClock;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EventMapper {

    private final EventClock eventClock;

    public EventResponse toEventResponse(Event event, Map<String, Long> registeredCounts) {
        return EventResponse.builder()
                .id(event.getId())
                .shortCode(event.getShortCode())
                .name(event.getName())
                .description(event.getDescription())
                .theme(event.getTheme())
                .contactEmail(event.getContactEmail())
                .prizes(event.getPrizes())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .registrationStartDate(event.getRegistrationStartDate())
                .registrationEndDate(event.getRegistrationEndDate())
                .judging(Boolean.TRUE.equals(event.getJudging()))
                .resultsDate(event.getResultsDate())
                .venue(event.getVenue())
                .isVirtual(event.isVirtual())
                .location(event.getLocation())
                .maxParticipants(event.getMaxParticipants())
                .teamSize(event.getTeamSize())
                .registeredCount(registeredCounts.getOrDefault(event.getId(), 0L).intValue())
                .status(event.calculateCurrentStatus(eventClock.now()))
                .organizerId(event.getOrganizerId())
                .problemStatements(event.getProblemStatements().stream()
                        .map(this::toProblemStatementResponse)
                        .toList())
                .build();
    }

    public EventResponse.ProblemStatementResponse toProblemStatementResponse(ProblemStatement ps) {
        return EventResponse.ProblemStatementResponse.builder()
                .id(ps.getId())
                .statementId(ps.getStatementId())
                .name(ps.getName())
                .statement(ps.getStatement())
                .requirements(ps.getRequirements())
                .build();
    }

    public RegistrationResponse toRegistrationResponse(Registration reg) {
        return RegistrationResponse.builder()
                .id(reg.getId())
                .eventId(reg.getEventId())
                .userId(reg.getUserId())
                .username(reg.getUsername())
                .userEmail(reg.getUserEmail())
                .status(reg.getStatus())
                .registrationTime(reg.getRegistrationTime())
                .build();
    }

    public List<RegistrationResponse> toRegistrationResponses(List<Registration> registrations) {
        return registrations.stream().map(this::toRegistrationResponse).toList();
    }
}
