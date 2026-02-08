package com.ehub.common.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum RegistrationStatus {
    PENDING("PENDING"),
    APPROVED("APPROVED"),
    REJECTED("REJECTED");

    private final String value;

    RegistrationStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
