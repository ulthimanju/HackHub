package com.ehub.ai.service;

import com.ehub.ai.dto.EvaluationContext;
import com.ehub.ai.model.GeminiResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

/**
 * Dedicated HTTP client for all communication with the event-service.
 *
 * Centralises header injection (X-Internal-Secret) and error handling so
 * callers never need to construct HttpEntity or handle header concerns.
 */
@Service
@Slf4j
public class EventServiceClient {

    private final RestTemplate restTemplate;

    @Value("${application.event-service-url}")
    private String eventServiceUrl;

    @Value("${application.internal-secret:}")
    private String internalSecret;

    public EventServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /** Fetch the evaluation context for a single team. */
    @SuppressWarnings("unchecked")
    public EvaluationContext getTeamContext(String teamId) {
        String url = eventServiceUrl + "/events/teams/" + teamId + "/evaluation-context";
        ResponseEntity<Object> response = exchange(url, HttpMethod.GET, null, Object.class);
        return mapToContext((Map<String, Object>) response.getBody());
    }

    /** Fetch evaluation contexts for all teams in an event. */
    @SuppressWarnings("unchecked")
    public List<EvaluationContext> getEventContexts(String eventId) {
        String url = eventServiceUrl + "/events/teams/event/" + eventId + "/evaluation-context";
        ResponseEntity<Object> response = exchange(url, HttpMethod.GET, null, Object.class);
        List<Map<String, Object>> raw = (List<Map<String, Object>>) response.getBody();
        if (raw == null)
            return List.of();
        return raw.stream().map(this::mapToContext).toList();
    }

    /**
     * Reports a successful evaluation result to the event-service.
     * Uses score=result.score and aiSummary=result.summary.
     */
    public void reportSuccess(String teamId, GeminiResult result) {
        String encodedSummary = URLEncoder.encode(result.summary(), StandardCharsets.UTF_8);
        String url = eventServiceUrl + "/events/teams/" + teamId
                + "/score?score=" + result.score()
                + "&aiSummary=" + encodedSummary;
        try {
            exchange(url, HttpMethod.POST, null, Void.class);
        } catch (Exception e) {
            log.warn("Failed to report success for team {}", teamId, e);
        }
    }

    /**
     * Reports an evaluation failure to the event-service.
     * Stores score=0 with a structured error marker in aiSummary.
     */
    public void reportError(String teamId, String reason) {
        String summary = "EVAL_ERROR: " + (reason.length() > 185 ? reason.substring(0, 185) + "…" : reason);
        String encodedSummary = URLEncoder.encode(summary, StandardCharsets.UTF_8);
        String url = eventServiceUrl + "/events/teams/" + teamId
                + "/score?score=0&aiSummary=" + encodedSummary;
        try {
            exchange(url, HttpMethod.POST, null, Void.class);
        } catch (Exception e) {
            log.warn("Failed to report error for team {}", teamId, e);
        }
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    private <T> ResponseEntity<T> exchange(String url, HttpMethod method, Object body, Class<T> responseType) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Secret", internalSecret);
        if (body != null)
            headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<?> entity = body != null ? new HttpEntity<>(body, headers) : new HttpEntity<>(headers);
        return restTemplate.exchange(url, method, entity, responseType);
    }

    private EvaluationContext mapToContext(Map<String, Object> m) {
        return new EvaluationContext(
                str(m, "teamId"),
                str(m, "teamName"),
                str(m, "repoUrl"),
                str(m, "problemStatement"),
                str(m, "requirements"),
                str(m, "theme"));
    }

    private String str(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v != null ? v.toString() : null;
    }
}
