package com.ehub.event.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "event_references")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventReference {

    /** Primary key — one reference document per event. */
    @Id
    private String eventId;

    @Column(columnDefinition = "TEXT")
    private String contentMd;
}
