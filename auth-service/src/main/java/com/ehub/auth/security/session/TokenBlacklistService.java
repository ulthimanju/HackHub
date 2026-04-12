package com.ehub.auth.security.session;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private static final String PREFIX = "token_blacklist:";
    private final RedisTemplate<String, String> redisTemplate;

    public void blacklist(String jti, long remainingMs) {
        if (remainingMs > 0) {
            redisTemplate.opsForValue().set(PREFIX + jti, "1", remainingMs, TimeUnit.MILLISECONDS);
        }
    }

    public boolean isBlacklisted(String jti) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(PREFIX + jti));
    }
}
