package com.ehub.event.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {
    @Id
    private String id;

    @Column(unique = true)
    private String shortCode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String eventId;

    private String problemStatementId;

    private String repoUrl;
    private String demoUrl;

    private java.time.LocalDateTime submissionTime;

    private Double score;

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    private Double manualScore;

    @Column(columnDefinition = "TEXT")
    private String organizerNotes;

    @Column(nullable = false)
    private String leaderId; // User ID of the leader

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> skillsNeeded;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TeamMember> members = new ArrayList<>();

    /** Returns the authoritative score: manual score takes precedence over AI score. */
    public Double getFinalScore() {
        return manualScore != null ? manualScore : score;
    }
}
