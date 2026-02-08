package com.ehub.gateway.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    public static final List<String> openApiEndpoints = List.of(
            "/auth/register",
            "/auth/register/otp",
            "/auth/upgrade-role",
            "/auth/upgrade-role/otp",
            "/auth/login",
            "/auth/validate-token",
            "/fallback",
            "/ws-notifications",
            "/eureka"
    );

    public Predicate<ServerHttpRequest> isSecured =
            request -> !request.getMethod().name().equals("OPTIONS") && 
                    openApiEndpoints
                    .stream()
                    .noneMatch(uri -> request.getURI().getPath().contains(uri));

}
