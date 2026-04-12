package com.ehub.event.shared.repository;

import com.ehub.event.shared.entity.ProblemStatement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemStatementRepository extends JpaRepository<ProblemStatement, String> {
}
