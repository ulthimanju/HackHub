package com.ehub.event.dto;

import com.ehub.event.shared.enums.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventResponse {
    private String id;
    private String shortCode;
    private String name;
    private String description;
    private String theme;
    private String contactEmail;
    private List<String> prizes;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime registrationStartDate;
    private LocalDateTime registrationEndDate;
    private boolean judging;
    private LocalDateTime resultsDate;
    private String venue;
    private boolean isVirtual;
    private String location;
    private Integer maxParticipants;
    private Integer teamSize;
    private Integer registeredCount;
    private EventStatus status;
    private String organizerId;
    private List<ProblemStatementResponse> problemStatements;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProblemStatementResponse {
        private String id;
        private String statementId;
        private String name;
        private String statement;
        private String requirements;
    }
}