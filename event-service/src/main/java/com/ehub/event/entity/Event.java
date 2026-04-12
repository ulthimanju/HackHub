package com.ehub.event.entity;

import java.util.ArrayList;
import java.util.List;

import com.ehub.event.enums.EventStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {
    @Id
    private String id;

    @Column(unique = true)
    private String shortCode;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String theme;
    private String contactEmail;

    @ElementCollection
    @CollectionTable(name = "event_prizes", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "prize")
    private List<String> prizes;

    private java.time.LocalDateTime startDate;
    private java.time.LocalDateTime endDate;
    private java.time.LocalDateTime registrationStartDate;
    private java.time.LocalDateTime registrationEndDate;
    @Builder.Default
    private Boolean judging = true;
    private java.time.LocalDateTime resultsDate;

    private String venue;
    private boolean isVirtual;
    private String location;

    private Integer maxParticipants;
    private Integer teamSize;

    @Enumerated(EnumType.STRING)
    private EventStatus status;

    @Column(nullable = false)
    private String organizerId;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProblemStatement> problemStatements = new ArrayList<>();

    public EventStatus calculateCurrentStatus() {
        return calculateCurrentStatus(java.time.LocalDateTime.now());
    }

    public EventStatus calculateCurrentStatus(java.time.LocalDateTime now) {

        // Before Registration
        if (registrationStartDate != null && now.isBefore(registrationStartDate))
            return EventStatus.UPCOMING;

        // During Registration
        if (registrationStartDate != null && registrationEndDate != null &&
                !now.isBefore(registrationStartDate) && !now.isAfter(registrationEndDate))
            return EventStatus.REGISTRATION_OPEN;

        // After Registration but before Event Start
        if (startDate != null && now.isBefore(startDate))
            return EventStatus.UPCOMING;

        // During Event
        if (startDate != null && endDate != null &&
                !now.isBefore(startDate) && !now.isAfter(endDate))
            return EventStatus.ONGOING;

        // Judging Phase (Automatic if endDate passed and judging boolean is true)
        if (endDate != null && now.isAfter(endDate) && Boolean.TRUE.equals(judging))
            return EventStatus.JUDGING;

        // Results Announced (If judging is false but resultsDate hasn't passed or is
        // exactly now)
        if (endDate != null && now.isAfter(endDate) && !Boolean.TRUE.equals(judging)) {
            if (resultsDate != null && now.isAfter(resultsDate))
                return EventStatus.COMPLETED;
            return EventStatus.RESULTS_ANNOUNCED;
        }

        return EventStatus.UPCOMING;
    }
}