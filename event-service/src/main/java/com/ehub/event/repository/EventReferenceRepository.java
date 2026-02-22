package com.ehub.event.repository;

import com.ehub.event.entity.EventReference;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventReferenceRepository extends JpaRepository<EventReference, String> {
}
