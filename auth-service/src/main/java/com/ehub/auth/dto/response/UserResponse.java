package com.ehub.auth.dto.response;

import com.ehub.auth.enums.ExperienceLevel;
import com.ehub.auth.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private String id;
    private String username;
    private String displayName;
    private String email;
    private UserRole role;
    private List<String> skills;
    private String bio;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private ExperienceLevel experienceLevel;
    private boolean openToInvites;
}
