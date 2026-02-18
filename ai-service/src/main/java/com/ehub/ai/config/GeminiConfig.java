package com.ehub.ai.config;

import com.google.genai.Client;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {

    // Client auto-reads GOOGLE_API_KEY from environment
    @Bean
    public Client geminiClient() {
        return new Client();
    }
}
