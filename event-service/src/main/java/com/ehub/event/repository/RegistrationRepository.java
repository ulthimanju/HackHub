package com.ehub.event.repository;

import com.ehub.event.entity.Registration;
import com.ehub.event.enums.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, String> {
    List<Registration> findByEventId(String eventId);
    List<Registration> findByUserId(String userId);
    Optional<Registration> findByEventIdAndUserId(String eventId, String userId);
    boolean existsByEventIdAndUserId(String eventId, String userId);
    long countByEventId(String eventId);
    long countByEventIdAndStatus(String eventId, RegistrationStatus status);

    @Query("SELECT r.eventId, COUNT(r) FROM Registration r WHERE r.eventId IN :eventIds AND r.status = :status GROUP BY r.eventId")
    List<Object[]> countByEventIdsAndStatus(@Param("eventIds") List<String> eventIds, @Param("status") RegistrationStatus status);

    default Map<String, Long> countApprovedByEventIds(List<String> eventIds) {
        if (eventIds == null || eventIds.isEmpty()) return Map.of();
        return countByEventIdsAndStatus(eventIds, RegistrationStatus.APPROVED)
                .stream().collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));
    }
}
