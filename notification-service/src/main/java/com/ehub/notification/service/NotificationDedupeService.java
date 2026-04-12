package com.ehub.notification.service;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationDedupeService {

    private static final String KEY_PREFIX = "notif:dedupe:";

    private final StringRedisTemplate stringRedisTemplate;

    @Value("${application.kafka.dedupe-ttl-hours:24}")
    private long dedupeTtlHours;

    public boolean firstTime(String dedupeKey) {
        Boolean inserted = stringRedisTemplate.opsForValue().setIfAbsent(
                KEY_PREFIX + dedupeKey,
                "1",
                Duration.ofHours(Math.max(dedupeTtlHours, 1)));
        return Boolean.TRUE.equals(inserted);
    }
}