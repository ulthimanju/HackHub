package com.ehub.event.port;

import java.time.LocalDateTime;

public interface EventClock {
    LocalDateTime now();
}
