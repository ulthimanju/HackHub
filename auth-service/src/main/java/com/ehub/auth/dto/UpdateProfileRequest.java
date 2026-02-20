package com.ehub.auth.dto;

import com.ehub.auth.enums.ExperienceLevel;
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
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private ExperienceLevel experienceLevel;
    private Boolean openToInvites;
}
