package com.ehub.event.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class LifecycleResponse {
    private String status;
    private String updatedAt;
    @JsonProperty("isLocked")
    private boolean isLocked;
    private List<String> allowedActions;
    private Map<String, String> phaseTimestamps;
}
