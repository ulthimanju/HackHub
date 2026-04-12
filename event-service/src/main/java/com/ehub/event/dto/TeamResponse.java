package com.ehub.event.dto;

import com.ehub.event.shared.enums.TeamMemberStatus;
import com.ehub.event.shared.enums.TeamRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamResponse {
    private String id;
    private String shortCode;
    private String name;
    private String eventId;
    private String problemStatementId;
    private String repoUrl;
    private String demoUrl;
    private java.time.LocalDateTime submissionTime;
    private Double score;
    private String aiSummary;
    private Double manualScore;
    private String organizerNotes;
    /** Final authoritative score: manualScore if set, otherwise AI score. */
    private Double finalScore;
    private String leaderId;
    private List<String> skillsNeeded;
    private List<TeamMemberResponse> members;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamMemberResponse {
        private String id;
        private String userId;
        private String username;
        private String userEmail;
        private TeamRole role;
        private TeamMemberStatus status;
    }
}