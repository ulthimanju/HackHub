package com.ehub.event.repository;

import com.ehub.event.entity.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, String> {
    List<Team> findByEventId(String eventId);
    Page<Team> findByEventId(String eventId, Pageable pageable);
    Optional<Team> findByEventIdAndLeaderId(String eventId, String leaderId);
    Optional<Team> findByShortCode(String shortCode);
    long countByEventId(String eventId);
    long countByEventIdAndRepoUrlIsNotNull(String eventId);
    long countByEventIdAndScoreIsNotNull(String eventId);

    @Query("SELECT AVG(t.score) FROM Team t WHERE t.eventId = :eventId AND t.score IS NOT NULL")
    Double avgScoreByEventId(@Param("eventId") String eventId);

    @Query("SELECT MAX(t.score) FROM Team t WHERE t.eventId = :eventId AND t.score IS NOT NULL")
    Double maxScoreByEventId(@Param("eventId") String eventId);
}
