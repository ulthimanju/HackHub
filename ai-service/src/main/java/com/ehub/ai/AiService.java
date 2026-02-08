package com.ehub.ai;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
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
    private static final String QUEUE_KEY = "ehub:ai:evaluation:queue";
    private final AtomicBoolean isBulkEvaluating = new AtomicBoolean(false);

    @Value("${GEMINI_API_KEY}")
    private String geminiApiKey;

    @Value("${APPLICATION_EVENT_SERVICE_URL}")
    private String eventServiceUrl;

    @PostConstruct
    public void startWorker() {
        // ... worker logic (unchanged)
    }

    // ... (queueEventEvaluation and evaluateTeam methods unchanged)

    private Double processEvaluation(Map<String, Object> context) {
        String teamId = context.get("teamId").toString();
        String repoUrl = (String) context.get("repoUrl");
        String problemStatement = (String) context.getOrDefault("problemStatement", "No problem statement provided.");
        String teamName = (String) context.get("teamName");

        System.out.println("Processing deep evaluation for team: " + teamName + " (" + teamId + ")");
        
        try {
            // NEW: Fetch actual code content
            String sourceCode = githubService.fetchRepoContent(repoUrl);
            
            // Capture both score and summary
            Map<String, Object> evaluationResult = callGeminiForEvaluation(teamName, problemStatement, repoUrl, sourceCode);
            Double score = (Double) evaluationResult.get("score");
            String summary = (String) evaluationResult.get("summary");

            updateScoreInEventService(teamId, score, summary);
            
            // Broadcast update
            Map<String, Object> broadcastPayload = new HashMap<>();
            broadcastPayload.put("teamId", teamId);
            broadcastPayload.put("teamName", teamName);
            broadcastPayload.put("score", score);
            broadcastPayload.put("summary", summary);
            broadcastPayload.put("timestamp", System.currentTimeMillis());
            
            redisTemplate.convertAndSend("ehub:broadcast:leaderboard", broadcastPayload);
            
            return score;
        } catch (Exception e) {
            System.err.println("Evaluation failed for team " + teamId + ": " + e.getMessage());
            return 0.0;
        }
    }

    private void updateScoreInEventService(String teamId, Double score, String summary) {
        try {
            String scoreUrl = eventServiceUrl + "/events/teams/" + teamId + "/score?score=" + score + "&aiSummary=" + summary;
            restTemplate.postForEntity(scoreUrl, null, String.class);
        } catch (Exception e) {
            System.err.println("Failed to update score for team " + teamId + ": " + e.getMessage());
        }
    }

    private Map<String, Object> callGeminiForEvaluation(String teamName, String problemStatement, String repoUrl, String sourceCode) {
        Map<String, Object> result = new HashMap<>();
        result.put("score", 0.0);
        result.put("summary", "No evaluation available.");

        try {
            Client client = new Client(); 
            
            String prompt = String.format(
                "You are an expert Senior Software Engineer and Judge. Evaluate the following hackathon project based on the provided source code and problem statement.\n\n" +
                "PROBLEM STATEMENT:\n%s\n\n" +
                "REPOSITORY URL: %s\n\n" +
                "SOURCE CODE CONTENT:\n%s\n\n" +
                "--- EVALUATION CRITERIA (Total 100%%) ---\n" +
                "1. INNOVATION (20%%): Does the code use creative solutions? Is the idea unique?\n" +
                "2. TECHNICAL COMPLEXITY (20%%): Are the algorithms/architecture advanced? Does it solve a hard problem?\n" +
                "3. DESIGN & IMPLEMENTATION (20%%): Is the code clean, readable, and well-structured? (Check for patterns, DRY, SOLID)\n" +
                "4. POTENTIAL IMPACT (20%%): Does the implementation actually fulfill the goal described in the problem statement?\n" +
                "5. THEME FIT (20%%): Is the solution relevant to the hackathon theme?\n\n" +
                "IMPORTANT: Analyze the code for bugs, hardcoded secrets, or logic errors. If the 'SOURCE CODE CONTENT' says it couldn't fetch the code, score based on the README only but penalize significantly.\n\n" +
                "Respond ONLY with a JSON object containing a field 'score' (0-100) and a field 'summary' (max 200 chars explaining the score).\n" +
                "Example: {\"score\": 82.5, \"summary\": \"Clean React structure and innovative use of WebSockets, but missing error handling in the API layer.\"}",
                problemStatement, repoUrl, sourceCode
            );

            GenerateContentResponse response = client.models.generateContent(
                "gemini-3-flash-preview", 
                prompt, 
                null
            );

            String text = response.text();
            String jsonStr = text.replaceAll("```json", "").replaceAll("```", "").trim();
            
            if (jsonStr.contains("\"score\":")) {
                // Parse score
                String scorePart = jsonStr.split("\"score\":")[1].split(",")[0].replace("}", "").replace("]", "").trim();
                result.put("score", Double.parseDouble(scorePart));
                
                // Parse summary
                if (jsonStr.contains("\"summary\":")) {
                    String summaryPart = jsonStr.split("\"summary\":")[1].split("\"")[1].trim();
                    result.put("summary", summaryPart);
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini SDK call failed: " + e.getMessage());
        }
        return result;
    }
}
