package com.ehub.ai.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;

import com.ehub.ai.adapter.ClasspathPromptLoader;
import com.ehub.ai.reporting.EventServiceReportingAdapter;
import com.ehub.ai.adapter.GeminiAnalyzerAdapter;
import com.ehub.ai.adapter.RedisQueueAdapter;
import com.ehub.ai.port.AnalyzerPort;
import com.ehub.ai.reporting.EvaluationReportingPort;
import com.ehub.ai.port.PromptLoader;
import com.ehub.ai.port.QueuePort;
import com.ehub.ai.reporting.EventServiceClient;
import com.ehub.ai.service.GeminiCliWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class InfrastructureConfig {

    @Bean
    public RedisQueueAdapter redisQueueAdapter(RedisTemplate<String, Object> redisTemplate, ObjectMapper objectMapper) {
        return new RedisQueueAdapter(redisTemplate, objectMapper);
    }

    @Bean
    public ClasspathPromptLoader classpathPromptLoader() {
        return new ClasspathPromptLoader();
    }

    @Bean
    public GeminiAnalyzerAdapter geminiAnalyzerAdapter(GeminiCliWrapper geminiCliWrapper) {
        return new GeminiAnalyzerAdapter(geminiCliWrapper);
    }

    @Bean
    public EventServiceReportingAdapter eventServiceReportingAdapter(EventServiceClient eventServiceClient) {
        return new EventServiceReportingAdapter(eventServiceClient);
    }

    @Bean
    public QueuePort queuePort(RedisQueueAdapter redisQueueAdapter) {
        return redisQueueAdapter;
    }

    @Bean
    public PromptLoader promptLoader(ClasspathPromptLoader classpathPromptLoader) {
        return classpathPromptLoader;
    }

    @Bean
    public AnalyzerPort analyzerPort(GeminiAnalyzerAdapter geminiAnalyzerAdapter) {
        return geminiAnalyzerAdapter;
    }

    @Bean
    public EvaluationReportingPort evaluationReportingPort(EventServiceReportingAdapter reportingAdapter) {
        return reportingAdapter;
    }
}
