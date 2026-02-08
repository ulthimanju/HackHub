package com.ehub.common.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum TeamRole {
    LEADER("LEADER"),
    MEMBER("MEMBER");

    private final String value;

    TeamRole(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
