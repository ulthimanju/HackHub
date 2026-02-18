package com.ehub.event.entity;

import com.ehub.event.enums.RegistrationStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_registrations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"eventId", "userId"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Registration {
    @Id
    private String id;

    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Column(nullable = false)
    private String userId;

    private String username;
    private String userEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus status; 

    @Column(nullable = false)
    private LocalDateTime registrationTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", insertable = false, updatable = false)
    private Event event;
}
