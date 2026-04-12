package com.ehub.event.shared.adapter;

import java.time.LocalDateTime;

import com.ehub.event.shared.port.EventClock;

public class SystemEventClock implements EventClock {

    @Override
    public LocalDateTime now() {
        return LocalDateTime.now();
    }
}
