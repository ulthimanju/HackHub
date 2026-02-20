package com.ehub.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventStatsResponse {
    private long totalRegistrations;
    private long pendingRegistrations;
    private long approvedRegistrations;
    private long rejectedRegistrations;
    private long totalTeams;
    private long submittedTeams;
    private long evaluatedTeams;
    private Double avgScore;
    private Double maxScore;
}
