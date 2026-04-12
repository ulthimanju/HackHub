package com.ehub.event.shared.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum TeamMemberStatus {
    INVITED("INVITED"),    // Leader invited user
    REQUESTED("REQUESTED"),  // User requested to join
    ACCEPTED("ACCEPTED");    // Member is part of the team

    private final String value;

    TeamMemberStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
