package com.ehub.event.shared.port;

import java.time.LocalDateTime;

public interface EventClock {
    LocalDateTime now();
}
