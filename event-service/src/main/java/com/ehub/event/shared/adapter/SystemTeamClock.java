package com.ehub.event.shared.adapter;

import java.time.LocalDateTime;

import com.ehub.event.shared.port.TeamClock;

public class SystemTeamClock implements TeamClock {

    @Override
    public LocalDateTime now() {
        return LocalDateTime.now();
    }
}
