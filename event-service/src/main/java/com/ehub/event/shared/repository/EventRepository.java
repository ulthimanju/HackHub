package com.ehub.event.shared.repository;

import com.ehub.event.shared.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, String> {
    List<Event> findByOrganizerId(String organizerId);
    Page<Event> findByOrganizerId(String organizerId, Pageable pageable);
    Optional<Event> findByShortCode(String shortCode);
}
