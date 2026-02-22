package com.ehub.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class EventRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    private String theme;
    private String contactEmail;
    
    private List<String> prizes;
    
    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;
    
    @NotNull(message = "End date is required")
    private LocalDateTime endDate;
    
    private LocalDateTime registrationStartDate;
    private LocalDateTime registrationEndDate;
    private boolean judging = true;
    private LocalDateTime resultsDate;
    
    private String venue;
    private boolean isVirtual;
    private String location;
    
    private Integer maxParticipants;
    private Integer teamSize;
}