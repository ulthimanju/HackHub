package com.ehub.event.repository;

import com.ehub.event.entity.Registration;
import com.ehub.event.enums.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, String> {
    List<Registration> findByEventId(String eventId);
    List<Registration> findByUserId(String userId);
    Optional<Registration> findByEventIdAndUserId(String eventId, String userId);
    boolean existsByEventIdAndUserId(String eventId, String userId);
    long countByEventId(String eventId);
    long countByEventIdAndStatus(String eventId, RegistrationStatus status);
}
