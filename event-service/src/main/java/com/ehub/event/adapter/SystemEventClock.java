package com.ehub.event.adapter;

import java.time.LocalDateTime;

import com.ehub.event.port.EventClock;

public class SystemEventClock implements EventClock {

    @Override
    public LocalDateTime now() {
        return LocalDateTime.now();
    }
}
