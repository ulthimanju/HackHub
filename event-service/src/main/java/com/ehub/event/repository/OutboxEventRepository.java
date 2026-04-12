package com.ehub.event.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.ehub.event.entity.OutboxEvent;
import com.ehub.event.enums.OutboxStatus;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, String> {
    List<OutboxEvent> findTop100ByStatusOrderByCreatedAtAsc(OutboxStatus status);

    long countByStatus(OutboxStatus status);

    @Query("SELECT e.status, COUNT(e) FROM OutboxEvent e GROUP BY e.status")
    List<Object[]> countGroupedByStatus();
}