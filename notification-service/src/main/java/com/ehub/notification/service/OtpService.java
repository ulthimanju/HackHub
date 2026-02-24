package com.ehub.notification.service;

import lombok.RequiredArgsConstructor;
import com.ehub.notification.dto.OtpPurpose;
import com.ehub.notification.util.MessageKeys;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final StringRedisTemplate redisTemplate;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.otp.rate-limit.item-limit}")
    private int itemLimit;

    @Value("${app.otp.rate-limit.time-limit-minutes}")
    private int timeLimitMinutes;

    private static final int MAX_VALIDATION_ATTEMPTS = 5;
    private static final int BLOCK_DURATION_MINUTES  = 15;

    public String generateOtp(String email, OtpPurpose purpose) {
        String otpKey   = key("OTP",          purpose, email);
        String limitKey = key("OTP_LIMIT",    purpose, email);

        // 1. Increment and get the count atomically
        Long count = redisTemplate.opsForValue().increment(limitKey);

        // 2. If it's the first request, set the expiration
        if (count != null && count == 1) {
            redisTemplate.expire(limitKey, timeLimitMinutes, TimeUnit.MINUTES);
        }

        // 3. Check against the limit
        if (count != null && count > itemLimit) {
            throw new RuntimeException(String.format(MessageKeys.RATE_LIMIT_EXCEEDED.getMessage(), timeLimitMinutes));
        }

        // 4. Check for existing OTP (Resend logic — reuse until it expires)
        String otp = redisTemplate.opsForValue().get(otpKey);
        if (otp == null) {
            otp = String.format("%06d", secureRandom.nextInt(1000000));
        }

        // 5. Store/Refresh with 10 minutes expiry
        redisTemplate.opsForValue().set(otpKey, otp, 10, TimeUnit.MINUTES);

        return otp;
    }

    public boolean validateOtp(String email, String otp, OtpPurpose purpose) {
        String blockedKey = key("OTP_BLOCKED",  purpose, email);
        if (Boolean.TRUE.equals(redisTemplate.hasKey(blockedKey))) {
            throw new RuntimeException(
                String.format(MessageKeys.OTP_TOO_MANY_ATTEMPTS.getMessage(), BLOCK_DURATION_MINUTES));
        }

        String otpKey     = key("OTP",          purpose, email);
        String attemptKey = key("OTP_ATTEMPTS", purpose, email);
        String storedOtp  = redisTemplate.opsForValue().get(otpKey);

        if (storedOtp != null && storedOtp.equals(otp)) {
            redisTemplate.delete(otpKey);
            redisTemplate.delete(attemptKey);
            return true;
        }

        // Failed attempt — increment counter
        Long attempts = redisTemplate.opsForValue().increment(attemptKey);
        if (attempts != null && attempts == 1) {
            redisTemplate.expire(attemptKey, 30, TimeUnit.MINUTES);
        }
        if (attempts != null && attempts >= MAX_VALIDATION_ATTEMPTS) {
            redisTemplate.delete(otpKey);
            redisTemplate.delete(attemptKey);
            redisTemplate.opsForValue().set(blockedKey, "1", BLOCK_DURATION_MINUTES, TimeUnit.MINUTES);
            throw new RuntimeException(
                String.format(MessageKeys.OTP_TOO_MANY_ATTEMPTS.getMessage(), BLOCK_DURATION_MINUTES));
        }
        return false;
    }

    /** Builds a namespaced Redis key: e.g. OTP:PASSWORD_RESET:user@example.com */
    private String key(String prefix, OtpPurpose purpose, String email) {
        return prefix + ":" + purpose.name() + ":" + email;
    }
}
