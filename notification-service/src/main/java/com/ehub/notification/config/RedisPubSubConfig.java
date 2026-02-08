package com.ehub.notification.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class RedisPubSubConfig {

    private final SimpMessagingTemplate messagingTemplate;

    @Bean
    RedisMessageListenerContainer container(RedisConnectionFactory connectionFactory,
                                            MessageListenerAdapter listenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(listenerAdapter, new PatternTopic("ehub:broadcast:*"));
        return container;
    }

    @Bean
    MessageListenerAdapter listenerAdapter() {
        MessageListenerAdapter adapter = new MessageListenerAdapter(new Object() {
            public void handleMessage(Map<String, Object> payload, String channel) {
                try {
                    // Channel format: ehub:broadcast:topic_name
                    String topic = channel.replace("ehub:broadcast:", "");
                    
                    if (topic.startsWith("user-")) {
                        // Targeted notification: ehub:broadcast:user-UUID
                        String userId = topic.replace("user-", "");
                        messagingTemplate.convertAndSendToUser(userId, "/queue/alerts", payload);
                    } else {
                        // Global topic: ehub:broadcast:leaderboard
                        messagingTemplate.convertAndSend("/topic/" + topic, payload);
                    }
                } catch (Exception e) {
                    System.err.println("Error processing Redis Pub/Sub message: " + e.getMessage());
                }
            }
        }, "handleMessage");
        adapter.setSerializer(new GenericJackson2JsonRedisSerializer());
        return adapter;
    }
}
