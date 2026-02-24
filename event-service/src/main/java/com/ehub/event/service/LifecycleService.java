package com.ehub.event.service;

import com.ehub.event.dto.LifecycleResponse;
import com.ehub.event.entity.Event;
import com.ehub.event.enums.EventStatus;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class LifecycleService {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public LifecycleResponse build(Event event, String role) {
        EventStatus status = event.getStatus() != null ? event.getStatus() : EventStatus.UPCOMING;
        boolean isOrganizer = "ORGANIZER".equalsIgnoreCase(role);
        return LifecycleResponse.builder()
                .status(status.name())
                .updatedAt(buildUpdatedAt(event))
                .isLocked(isLocked(status))
                .allowedActions(computeAllowedActions(status, isOrganizer))
                .phaseTimestamps(buildTimestamps(event))
                .build();
    }

    /** Compute an ETag value (without surrounding quotes) from the event's authoritative state. */
    public String computeEtag(Event event) {
        return nullSafe(event.getStatus())
                + "|" + nullSafe(event.getRegistrationEndDate())
                + "|" + nullSafe(event.getStartDate())
                + "|" + nullSafe(event.getEndDate());
    }

    private List<String> computeAllowedActions(EventStatus status, boolean isOrganizer) {
        List<String> actions = new ArrayList<>();
        if (isOrganizer) {
            switch (status) {
                case UPCOMING ->
                    actions.addAll(List.of("canEditEvent", "canManageProblems", "canAdvanceStatus"));
                case REGISTRATION_OPEN ->
                    actions.addAll(List.of("canEditEvent", "canManageProblems", "canManageRegistrations", "canAdvanceStatus"));
                case ONGOING ->
                    actions.addAll(List.of("canEditEvent", "canAdvanceStatus"));
                case JUDGING ->
                    actions.addAll(List.of("canEditEvent", "canEvaluate", "canManualReview", "canFinalize", "canAdvanceStatus"));
                case RESULTS_ANNOUNCED ->
                    actions.add("canAdvanceStatus");
                default -> { }
            }
        } else {
            switch (status) {
                case UPCOMING ->
                    actions.addAll(List.of("canCreateTeam", "canJoinTeam", "canEditTeamRoster"));
                case REGISTRATION_OPEN ->
                    actions.addAll(List.of("canRegister", "canCreateTeam", "canJoinTeam", "canEditTeamRoster"));
                case ONGOING ->
                    actions.addAll(List.of("canSubmit", "canJoinTeam", "canEditTeamRoster"));
                case RESULTS_ANNOUNCED, COMPLETED ->
                    actions.add("canViewLeaderboard");
                default -> { }
            }
        }
        return actions;
    }

    private boolean isLocked(EventStatus status) {
        return status == EventStatus.JUDGING
                || status == EventStatus.RESULTS_ANNOUNCED
                || status == EventStatus.COMPLETED;
    }

    private Map<String, String> buildTimestamps(Event event) {
        Map<String, String> ts = new LinkedHashMap<>();
        if (event.getRegistrationEndDate() != null)
            ts.put("registrationEnd", event.getRegistrationEndDate().format(ISO) + "Z");
        if (event.getStartDate() != null)
            ts.put("eventStart", event.getStartDate().format(ISO) + "Z");
        if (event.getEndDate() != null)
            ts.put("eventEnd", event.getEndDate().format(ISO) + "Z");
        if (event.getResultsDate() != null)
            ts.put("resultsDate", event.getResultsDate().format(ISO) + "Z");
        return ts;
    }

    private String buildUpdatedAt(Event event) {
        LocalDateTime latest = null;
        if (event.getStartDate() != null) latest = event.getStartDate();
        if (event.getEndDate() != null && (latest == null || event.getEndDate().isAfter(latest)))
            latest = event.getEndDate();
        if (event.getRegistrationEndDate() != null && (latest == null || event.getRegistrationEndDate().isAfter(latest)))
            latest = event.getRegistrationEndDate();
        return latest != null ? latest.format(ISO) + "Z" : "";
    }

    private String nullSafe(Object o) {
        return o != null ? o.toString() : "";
    }
}
