package com.ehub.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/auth")
    public Mono<ResponseEntity<String>> authFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("Authentication Service is currently unavailable. Please try again later."));
    }

    @GetMapping("/notification")
    public Mono<ResponseEntity<String>> notificationFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("Notification Service is currently unavailable. Please try again later."));
    }

    @GetMapping("/event")
    public Mono<ResponseEntity<String>> eventFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("Event Service is currently unavailable. Please try again later."));
    }

    @GetMapping("/ai")
    public Mono<ResponseEntity<String>> aiFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("AI Service is currently unavailable. Please try again later."));
    }
}
