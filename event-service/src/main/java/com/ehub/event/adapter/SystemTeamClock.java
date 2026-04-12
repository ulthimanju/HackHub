package com.ehub.event.adapter;

import java.time.LocalDateTime;

import com.ehub.event.port.TeamClock;

public class SystemTeamClock implements TeamClock {

    @Override
    public LocalDateTime now() {
        return LocalDateTime.now();
    }
}
