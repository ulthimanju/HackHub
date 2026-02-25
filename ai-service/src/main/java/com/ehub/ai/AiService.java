package com.ehub.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.io.*;
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
    private final AtomicBoolean isBulkEvaluating = new AtomicBoolean(false);

    @Value("${APPLICATION_EVENT_SERVICE_URL}")
    private String eventServiceUrl;

    @Value("${GATEWAY_INTERNAL_SECRET:}")
    private String internalSecret;

    @Value("${WORKSPACE_ROOT:/app/workspaces}")
    private String workspaceRoot;

    @Value("${WORKSPACE_VOLUME_NAME:ehub_ehub-workspaces}")
    private String workspaceVolumeName;

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
                HttpHeaders headers = new HttpHeaders();
                headers.set("X-Internal-Secret", internalSecret);
                HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
                
                ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, List.class);

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
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Secret", internalSecret);
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, Map.class);
        Map<String, Object> team = response.getBody();
        
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

        System.out.println("Evaluating team: " + teamName + " (attempt " + (retryCount + 1) + ") using Gemini CLI");

        try {
            String workspacePath = githubService.cloneRepoToWorkspace(repoUrl, teamId);
            try {
                Map<String, Object> result = callGeminiCliForEvaluation(teamName, workspacePath, problem, requirements, theme);
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
            } finally {
                githubService.cleanupWorkspace(workspacePath);
            }
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
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Secret", internalSecret);
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            
            restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);
        } catch (Exception e) {
            System.err.println("Failed to update score for team " + teamId + ": " + e.getMessage());
        }
    }

    private Map<String, Object> callGeminiCliForEvaluation(String teamName, String workspacePath,
                                                           String problemStatement, String requirements,
                                                           String theme) throws Exception {
        String prompt = String.format(
            "You are an expert Senior Software Engineer and Judge. Evaluate this hackathon project workspace.\n" +
            "HACKATHON THEME: %s\n" +
            "PROBLEM STATEMENT: %s\n" +
            "REQUIREMENTS: %s\n" +
            "--- EVALUATION CRITERIA (Total 100%%) ---\n" +
            "1. INNOVATION (20%%), 2. TECHNICAL COMPLEXITY (20%%), 3. DESIGN & IMPLEMENTATION (20%%), 4. POTENTIAL IMPACT (20%%), 5. THEME FIT (20%%)\n" +
            "Respond ONLY with valid JSON: {\"score\": <0-100>, \"summary\": \"<max 200 chars>\"}",
            theme, problemStatement, requirements
        );

        // Map host path (/app/workspaces/teamId) → container path (/workspaces/teamId)
        // Both refer to the same data via the ehub-workspaces named volume.
        String root = workspaceRoot.replaceAll("/$", "");
        String containerPath = "/workspaces" + workspacePath.substring(root.length());

        List<String> dockerCmd = new ArrayList<>(List.of(
            "docker", "run", "--rm",
            "-v", "gemini-credentials:/root/.gemini:ro",  // OAuth credentials (login once, reuse always)
            "-v", workspaceVolumeName + ":/workspaces",
            "gemini-cli:latest",
            "gemini-cli", "analyze", "--path", containerPath, "--prompt", prompt, "--format", "json"
        ));

        System.out.println("Running Gemini CLI via Docker for team: " + teamName);
        ProcessBuilder pb = new ProcessBuilder(dockerCmd);
        pb.redirectErrorStream(true);
        Process process = pb.start();

        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new RuntimeException("Gemini CLI failed with exit code " + exitCode + ": " + output.toString());
        }

        String jsonResult = output.toString().trim();
        // Extract JSON if there's noise in the output
        if (jsonResult.contains("{")) {
            jsonResult = jsonResult.substring(jsonResult.indexOf("{"), jsonResult.lastIndexOf("}") + 1);
        }

        Map<String, Object> result = new HashMap<>();
        try {
            Map<String, Object> parsed = objectMapper.readValue(jsonResult, Map.class);
            result.put("score", ((Number) parsed.get("score")).doubleValue());
            result.put("summary", parsed.get("summary").toString());
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini CLI output: " + e.getMessage() + " | Raw: " + output.toString());
            result.put("score", 0.0);
            result.put("summary", "Evaluation parsing failed.");
        }
        return result;
    }
}
