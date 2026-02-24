package com.ehub.event.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class TeamCreateRequest {
    @NotBlank(message = "Team name is required")
    private String name;
    
    private String userId;  // always overridden by the server from the authenticated principal

    private String username;
    private String userEmail;
    private List<String> skillsNeeded;
}
