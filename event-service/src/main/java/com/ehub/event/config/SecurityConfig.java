package com.ehub.event.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${application.internal.gateway-secret}")
    private String gatewayInternalSecret;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                // Force auth on private GET paths that share a prefix with public wildcards
                .requestMatchers(HttpMethod.GET,
                        "/events/organizer",
                        "/events/my-registrations",
                        "/events/my-registrations/status").authenticated()
                // Public discovery — unauthenticated GET allowed
                .requestMatchers(HttpMethod.GET,
                        "/events", "/events/*", "/events/code/*",
                        "/events/organizer/*", "/events/participant/*",
                        "/events/teams/*", "/events/teams/code/*").permitAll()
                // Every other request must be authenticated
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) -> {
                    res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    res.setContentType("application/json");
                    res.getWriter().write("{\"error\":\"Unauthorized\"}");
                })
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(new HeaderAuthenticationFilter(gatewayInternalSecret), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
