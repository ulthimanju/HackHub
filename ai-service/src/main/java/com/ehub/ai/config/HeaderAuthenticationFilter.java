package com.ehub.ai.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Authenticates requests via the X-Internal-Secret header.
 *
 * Behaviour:
 *   - Secret present + valid, user headers present → authenticates as that user/role
 *   - Secret present + valid, no user headers      → authenticates as system/ROLE_SYSTEM
 *   - Secret absent or invalid                     → request proceeds unauthenticated (Spring Security handles rejection)
 */
@Component
public class HeaderAuthenticationFilter extends OncePerRequestFilter {

    @Value("${application.internal-secret:}")
    private String internalSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String secret = request.getHeader("X-Internal-Secret");
        if (secret != null && !internalSecret.isBlank() && secret.equals(internalSecret)) {
            String userId = request.getHeader("X-User-Id");
            String role   = request.getHeader("X-User-Role");

            String principal = (userId != null && !userId.isBlank()) ? userId : "system";
            String authority = "ROLE_" + ((role != null && !role.isBlank()) ? role : "SYSTEM");

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    principal, null, List.of(new SimpleGrantedAuthority(authority)));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }
}
