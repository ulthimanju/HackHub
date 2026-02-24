package com.ehub.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class TeamSubmissionRequest {
    @NotBlank(message = "Repository URL is required")
    @Pattern(regexp = "^https?://[^\\s]+$", message = "Repository URL must start with http:// or https://")
    private String repoUrl;

    @Pattern(regexp = "^https?://[^\\s]+$", message = "Demo URL must start with http:// or https://")
    private String demoUrl;
}
