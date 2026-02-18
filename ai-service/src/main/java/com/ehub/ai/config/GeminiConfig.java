package com.ehub.ai.config;

import com.google.genai.Client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {

    @Value("${GOOGLE_API_KEY:${google.api.key:}}")
    private String googleApiKey;

    @Bean
    public Client geminiClient() {
        return new Client.Builder().apiKey(googleApiKey).build();
    }
}
