package com.ehub.event.dto;

import lombok.Data;

@Data
public class ManualReviewRequest {
    private Double manualScore;
    private String organizerNotes;
}
