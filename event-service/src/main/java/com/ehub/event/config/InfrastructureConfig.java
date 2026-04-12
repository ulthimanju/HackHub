package com.ehub.event.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.ehub.event.adapter.NotificationClientAdapter;
import com.ehub.event.adapter.SystemEventClock;
import com.ehub.event.adapter.SystemTeamClock;
import com.ehub.event.client.NotificationClient;
import com.ehub.event.port.EventClock;
import com.ehub.event.port.NotificationPort;
import com.ehub.event.port.TeamClock;

@Configuration
public class InfrastructureConfig {

    @Bean
    public NotificationPort notificationPort(NotificationClient notificationClient) {
        return new NotificationClientAdapter(notificationClient);
    }

    @Bean
    public EventClock eventClock() {
        return new SystemEventClock();
    }

    @Bean
    public TeamClock teamClock() {
        return new SystemTeamClock();
    }
}
