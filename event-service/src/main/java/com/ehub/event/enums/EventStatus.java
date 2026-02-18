package com.ehub.event.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum EventStatus {
    UPCOMING("UPCOMING"),
    REGISTRATION_OPEN("REGISTRATION_OPEN"),
    ONGOING("ONGOING"),
    JUDGING("JUDGING"),
    RESULTS_ANNOUNCED("RESULTS_ANNOUNCED"),
    COMPLETED("COMPLETED");

    private final String value;

    EventStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
