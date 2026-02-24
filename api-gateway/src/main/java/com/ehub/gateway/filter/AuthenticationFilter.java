package com.ehub.gateway.filter;

import com.ehub.gateway.util.JwtUtil;
import com.ehub.gateway.util.MessageKeys;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private RouteValidator validator;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${application.internal.gateway-secret}")
    private String internalSecret;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            // Always strip any X-User-* headers the client may have injected
            ServerHttpRequest stripped = exchange.getRequest().mutate()
                    .headers(h -> {
                        h.remove("X-User-Id");
                        h.remove("X-User-Role");
                        h.remove("X-User-Name");
                        h.remove("X-Internal-Secret");
                    })
                    .build();

            if (validator.isSecured.test(stripped)) {
                if (!stripped.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    throw new RuntimeException(MessageKeys.MISSING_AUTH_HEADER.getMessage());
                }

                String authHeader = stripped.getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7);
                }
                try {
                    jwtUtil.validateToken(authHeader);
                    Claims claims = jwtUtil.extractAllClaims(authHeader);
                    String userId = (String) claims.get("userId");
                    String role   = (String) claims.get("role");

                    ServerHttpRequest mutated = stripped.mutate()
                            .header("X-User-Id",        userId)
                            .header("X-User-Role",      role)
                            .header("X-User-Name",      claims.getSubject())
                            .header("X-Internal-Secret", internalSecret)
                            .build();

                    return chain.filter(exchange.mutate().request(mutated).build());

                } catch (Exception e) {
                    throw new RuntimeException(MessageKeys.UNAUTHORIZED_ACCESS.getMessage());
                }
            }

            // Non-secured route: forward without user headers but mark as gateway-originated
            ServerHttpRequest withSecret = stripped.mutate()
                    .header("X-Internal-Secret", internalSecret)
                    .build();
            return chain.filter(exchange.mutate().request(withSecret).build());
        });
    }

    public static class Config {
    }
}
