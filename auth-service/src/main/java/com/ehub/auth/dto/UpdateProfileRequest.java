package com.ehub.auth.dto;

import com.ehub.auth.enums.ExperienceLevel;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {
    private String username;
    private String displayName;
    private List<String> skills;
    private String bio;
    @Pattern(regexp = "^https?://[^\\s]+$", message = "GitHub URL must start with http:// or https://")
    private String githubUrl;
    @Pattern(regexp = "^https?://[^\\s]+$", message = "LinkedIn URL must start with http:// or https://")
    private String linkedinUrl;
    @Pattern(regexp = "^https?://[^\\s]+$", message = "Portfolio URL must start with http:// or https://")
    private String portfolioUrl;
    private ExperienceLevel experienceLevel;
    private Boolean openToInvites;
}
