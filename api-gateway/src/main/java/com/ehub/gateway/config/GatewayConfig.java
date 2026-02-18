package com.ehub.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;

@Configuration
public class GatewayConfig {

    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> {
            InetSocketAddress addr = exchange.getRequest().getRemoteAddress();
            return Mono.just(addr != null ? addr.getAddress().getHostAddress() : "unknown");
        };
    }
}
