package com.ehub.auth.shared.domain;

import com.fasterxml.jackson.annotation.JsonValue;

public enum UserRole {
    PARTICIPANT("participant"),
    ORGANIZER("organizer");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
