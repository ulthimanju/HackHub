package com.ehub.event.shared.repository;

import com.ehub.event.shared.entity.TeamMember;
import com.ehub.event.shared.enums.TeamMemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, String> {
    List<TeamMember> findByUserId(String userId);
    List<TeamMember> findByTeamId(String teamId);
    Optional<TeamMember> findByTeamIdAndUserId(String teamId, String userId);
    Optional<TeamMember> findByTeamEventIdAndUserId(String eventId, String userId);
    boolean existsByTeamIdAndUserId(String teamId, String userId);
    boolean existsByTeamEventIdAndUserIdAndStatus(String eventId, String userId, TeamMemberStatus status);
}
