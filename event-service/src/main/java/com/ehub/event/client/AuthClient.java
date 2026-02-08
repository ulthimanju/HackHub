package com.ehub.event.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class AuthClient {
    private final RestTemplate restTemplate;

    @Value("${APPLICATION_AUTH_SERVICE_URL:http://auth-service:8081}")
    private String authServiceUrl;

    public List<Map<String, Object>> getUsersBySkills(List<String> skills) {
        String url = authServiceUrl + "/auth/search/by-skills";
        return restTemplate.postForObject(url, skills, List.class);
    }
}
