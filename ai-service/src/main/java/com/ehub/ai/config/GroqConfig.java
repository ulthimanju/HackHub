package com.ehub.ai.config;

import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.HttpClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import java.util.concurrent.TimeUnit;

@Configuration
public class GroqConfig {

    @Value("${GROQ_API_KEY:}")
    private String groqApiKey;

    public String getGroqApiKey() {
        return groqApiKey;
    }

    @Bean
    public RestTemplate restTemplate() {
        RequestConfig config = RequestConfig.custom()
            .setConnectTimeout(10, TimeUnit.SECONDS)
            .setResponseTimeout(60, TimeUnit.SECONDS)
            .build();
        HttpClient httpClient = HttpClientBuilder.create()
            .setDefaultRequestConfig(config)
            .build();
        return new RestTemplate(new HttpComponentsClientHttpRequestFactory(httpClient));
    }
}
