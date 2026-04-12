package com.ehub.event.event.problem;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProblemStatementRequest {
    private String statementId;

    @NotBlank(message = "Problem name is required")
    private String name;

    @NotBlank(message = "Statement content is required")
    private String statement;

    @NotBlank(message = "Requirements are required")
    private String requirements;
}
