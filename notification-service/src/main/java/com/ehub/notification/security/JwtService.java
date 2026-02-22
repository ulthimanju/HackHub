package com.ehub.notification.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;

/**
 * Validates incoming JWT tokens (shared secret with auth-service) and extracts claims.
 * Used by WebSocketConfig to authenticate STOMP connections.
 */
@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    /**
     * Validates the token signature and expiry, then returns all claims.
     *
     * @throws JwtException if the token is invalid or expired
     */
    public Claims validateAndExtractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Extracts the userId claim (UUID string) from a validated token.
     * Returns null if the claim is absent.
     */
    public String extractUserId(Claims claims) {
        Object userId = claims.get("userId");
        return userId != null ? userId.toString() : null;
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
