package com.ehub.ai.util;

import lombok.Getter;

@Getter
public enum MessageKeys {

    EVALUATION_QUEUED_TEAM("Evaluation queued for team: %s"),
    EVALUATION_QUEUED_EVENT("Evaluation queued for event: %s");

    private final String message;

    MessageKeys(String message) {
        this.message = message;
    }
}
