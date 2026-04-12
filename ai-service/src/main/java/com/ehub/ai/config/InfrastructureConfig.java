package com.ehub.ai.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;

import com.ehub.ai.run.ClasspathPromptLoader;
import com.ehub.ai.reporting.EventServiceReportingAdapter;
import com.ehub.ai.run.GeminiAnalyzerAdapter;
import com.ehub.ai.queue.RedisQueueAdapter;
import com.ehub.ai.run.AnalyzerPort;
import com.ehub.ai.reporting.EvaluationReportingPort;
import com.ehub.ai.run.PromptLoader;
import com.ehub.ai.queue.QueuePort;
import com.ehub.ai.reporting.EventServiceClient;
import com.ehub.ai.run.GeminiCliWrapper;
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
