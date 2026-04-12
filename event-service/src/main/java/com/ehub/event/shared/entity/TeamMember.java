package com.ehub.event.shared.entity;

import com.ehub.event.shared.enums.TeamMemberStatus;
import com.ehub.event.shared.enums.TeamRole;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "team_members", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"team_id", "userId"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMember {
    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(nullable = false)
    private String userId;

    private String username;
    private String userEmail;

    @Enumerated(EnumType.STRING)
    private TeamRole role;

    @Enumerated(EnumType.STRING)
    private TeamMemberStatus status;
}
