package com.ehub.event.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "event_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRule {

    /** Primary key — one rules document per event. */
    @Id
    private String eventId;

    @Column(columnDefinition = "TEXT")
    private String contentMd;
}
