package com.ehub.event.repository;

import com.ehub.event.entity.EventRule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRuleRepository extends JpaRepository<EventRule, String> {
}
