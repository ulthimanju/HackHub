package com.ehub.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@RequiredArgsConstructor
public class AiService {

    private final RestTemplate restTemplate;
    private final RedisTemplate<String, Object> redisTemplate;
    private final GithubService githubService;
    private final ObjectMapper objectMapper;

    private static final String QUEUE_KEY  = "ehub:ai:evaluation:queue";
    private static final int    MAX_RETRIES = 3;
    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private final AtomicBoolean isBulkEvaluating = new AtomicBoolean(false);

    @Value("${APPLICATION_EVENT_SERVICE_URL}")
    private String eventServiceUrl;

    @Value("${GROQ_API_KEY:}")
    private String groqApiKey;

    @PostConstruct
    public void startWorker() {
        new Thread(() -> {
            while (true) {
                try {
                    Map<String, Object> context = (Map<String, Object>) redisTemplate.opsForList().rightPop(QUEUE_KEY, 5, TimeUnit.SECONDS);
                    if (context != null) {
                        processEvaluation(context);
                    }
                } catch (Exception e) {
                    System.err.println("Worker Error: " + e.getMessage());
                    try { Thread.sleep(5000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                }
            }
        }).start();
    }

    public void queueEventEvaluation(String eventId) {
        if (isBulkEvaluating.getAndSet(true)) return;

        new Thread(() -> {
            try {
                String url = eventServiceUrl + "/events/teams/event/" + eventId + "/evaluation-context";
                ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);

                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    List<Map<String, Object>> teams = response.getBody();
                    for (Map<String, Object> team : teams) {
                        team.put("retryCount", 0);
                        redisTemplate.opsForList().leftPush(QUEUE_KEY, team);
                    }
                }
            } finally {
                isBulkEvaluating.set(false);
            }
        }).start();
    }

    public Double evaluateTeam(String teamId) {
        String url = eventServiceUrl + "/events/teams/" + teamId + "/evaluation-context";
        Map<String, Object> team = restTemplate.getForObject(url, Map.class);
        if (team != null) {
            team.put("retryCount", 0);
            return processEvaluation(team);
        }
        return 0.0;
    }

    private Double processEvaluation(Map<String, Object> context) {
        String teamId   = context.get("teamId").toString();
        String repoUrl  = (String) context.get("repoUrl");
        String problem  = (String) context.getOrDefault("problemStatement", "No problem statement provided.");
        String requirements = (String) context.getOrDefault("requirements", "No specific requirements provided.");
        String theme    = (String) context.getOrDefault("theme", "No specific theme provided.");
        String teamName = (String) context.get("teamName");
        int retryCount  = context.get("retryCount") instanceof Number n ? n.intValue() : 0;

        System.out.println("Evaluating team: " + teamName + " (attempt " + (retryCount + 1) + ")");

        try {
            String sourceCode = githubService.fetchRepoContent(repoUrl);
            Map<String, Object> result = callGeminiForEvaluation(teamName, problem, requirements, theme, repoUrl, sourceCode);
            Double score   = (Double) result.get("score");
            String summary = (String) result.get("summary");

            updateScoreInEventService(teamId, score, summary);

            Map<String, Object> broadcast = new HashMap<>();
            broadcast.put("teamId",    teamId);
            broadcast.put("teamName",  teamName);
            broadcast.put("score",     score);
            broadcast.put("summary",   summary);
            broadcast.put("timestamp", System.currentTimeMillis());
            redisTemplate.convertAndSend("ehub:broadcast:leaderboard", broadcast);

            return score;
        } catch (Exception e) {
            System.err.println("Evaluation failed for team " + teamId + " (attempt " + (retryCount + 1) + "): " + e.getMessage());
            if (retryCount < MAX_RETRIES) {
                try {
                    context.put("retryCount", retryCount + 1);
                    redisTemplate.opsForList().leftPush(QUEUE_KEY, context);
                    System.out.println("Re-queued team " + teamId + " for retry " + (retryCount + 1));
                } catch (Exception redisEx) {
                    System.err.println("Failed to re-queue team " + teamId + ": " + redisEx.getMessage());
                }
            } else {
                System.err.println("Max retries reached for team " + teamId + ". Skipping.");
            }
            return 0.0;
        }
    }

    private void updateScoreInEventService(String teamId, Double score, String summary) {
        try {
            String url = eventServiceUrl + "/events/teams/" + teamId + "/score?score=" + score + "&aiSummary=" + summary;
            restTemplate.postForEntity(url, null, String.class);
        } catch (Exception e) {
            System.err.println("Failed to update score for team " + teamId + ": " + e.getMessage());
        }
    }

    // Throws on API failure so processEvaluation can retry.
    // JSON parse failures are handled locally (retrying won't fix a malformed response).
    private Map<String, Object> callGeminiForEvaluation(String teamName, String problemStatement,
                                                        String requirements, String theme,
                                                        String repoUrl, String sourceCode) throws Exception {
        String prompt = String.format(
            "You are an expert Senior Software Engineer and Judge. Evaluate the following hackathon project.\n\n" +
            "HACKATHON THEME: %s\n\n" +
            "PROBLEM STATEMENT:\n%s\n\n" +
            "REQUIREMENTS:\n%s\n\n" +
            "REPOSITORY URL: %s\n\n" +
            "SOURCE CODE CONTENT:\n%s\n\n" +
            "--- EVALUATION CRITERIA (Total 100%%) ---\n" +
            "1. INNOVATION (20%%): Creative solutions, unique idea?\n" +
            "2. TECHNICAL COMPLEXITY (20%%): Advanced algorithms/architecture?\n" +
            "3. DESIGN & IMPLEMENTATION (20%%): Clean, readable, well-structured? (DRY, SOLID)\n" +
            "4. POTENTIAL IMPACT (20%%): Does it fulfill the problem statement and requirements?\n" +
            "5. THEME FIT (20%%): Relevant to the hackathon theme?\n\n" +
            "Check for bugs, hardcoded secrets, or logic errors and penalize accordingly. " +
            "If source code could not be fetched, score from README only but penalize significantly.\n\n" +
            "Respond ONLY with a valid JSON object: {\"score\": <number 0-100>, \"summary\": \"<max 200 chars>\"}",
            theme, problemStatement, requirements, repoUrl, sourceCode
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey.strip());

        Map<String, Object> body = new HashMap<>();
        body.put("model", "llama-3.3-70b-versatile");
        body.put("temperature", 0.2);
        body.put("messages", List.of(Map.of("role", "user", "content", prompt)));

        System.out.println("Calling Groq API for team: " + teamName);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_API_URL, request, Map.class);
        System.out.println("Groq API responded with status: " + response.getStatusCode());

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        String text = message.get("content").toString()
            .replaceAll("```json", "").replaceAll("```", "").trim();

        Map<String, Object> result = new HashMap<>();
        result.put("score", 0.0);
        result.put("summary", "No evaluation available.");
        try {
            Map<String, Object> parsed = objectMapper.readValue(text, Map.class);
            result.put("score",   ((Number) parsed.get("score")).doubleValue());
            result.put("summary", parsed.get("summary").toString());
        } catch (Exception e) {
            System.err.println("JSON parsing failed for Groq response: " + e.getMessage() + " | Raw: " + text);
        }
        return result;
    }
}
