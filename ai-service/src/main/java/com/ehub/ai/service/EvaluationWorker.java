package com.ehub.ai.service;

import com.ehub.ai.dto.EvaluationContext;
import com.ehub.ai.model.EvaluationJob;
import com.ehub.ai.model.GeminiResult;
import com.ehub.ai.model.JobStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Orchestrates the AI evaluation pipeline.
 *
 * Queue   : Redis List   "ehub:ai:evaluation:queue"   — stores JSON EvaluationJob
 * Status  : Redis Hash   "ehub:ai:job:{teamId}"        — fields: status, retryCount, error, updatedAt
 *
 * Pipeline stages per job:
 *   QUEUED → CLONING → ANALYZING → COMPLETED (or FAILED)
 *
 * Retry policy: up to maxRetries for transient errors.
 *   Fatal workspace errors (repo not found, auth failure) skip retries immediately.
 */
@Service
public class EvaluationWorker {

    private static final String QUEUE_KEY      = "ehub:ai:evaluation:queue";
    private static final String JOB_KEY_PREFIX = "ehub:ai:job:";
    private static final int    JOB_TTL_HOURS  = 48;

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private final WorkspaceManager workspaceManager;
    private final GeminiCliWrapper geminiCli;
    private final EventServiceClient eventClient;

    @Value("${application.max-retries:3}")
    private int maxRetries;

    private String judgePromptTemplate;

    public EvaluationWorker(RedisTemplate<String, Object> redisTemplate,
                            ObjectMapper objectMapper,
                            WorkspaceManager workspaceManager,
                            GeminiCliWrapper geminiCli,
                            EventServiceClient eventClient) {
        this.redisTemplate    = redisTemplate;
        this.objectMapper     = objectMapper;
        this.workspaceManager = workspaceManager;
        this.geminiCli        = geminiCli;
        this.eventClient      = eventClient;
    }

    @PostConstruct
    public void init() throws IOException {
        // Load prompt template once at startup
        ClassPathResource resource = new ClassPathResource("templates/judge_prompt.md");
        judgePromptTemplate = resource.getContentAsString(StandardCharsets.UTF_8);

        // Start the background worker thread
        Thread worker = new Thread(this::runWorkerLoop, "ai-eval-worker");
        worker.setDaemon(true);
        worker.start();
        System.out.println("[EvaluationWorker] Started background evaluation worker.");
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /** Enqueues evaluation jobs for all teams in an event. Idempotent — skips already-queued teams. */
    public int queueEvent(String eventId) {
        List<EvaluationContext> contexts = eventClient.getEventContexts(eventId);
        int count = 0;
        for (EvaluationContext ctx : contexts) {
            if (ctx.repoUrl() == null || ctx.repoUrl().isBlank()) continue;
            enqueue(EvaluationJob.of(ctx));
            count++;
        }
        System.out.println("[EvaluationWorker] Queued " + count + " team(s) for event " + eventId);
        return count;
    }

    /** Enqueues a single team for evaluation. */
    public void queueTeam(String teamId) {
        EvaluationContext ctx = eventClient.getTeamContext(teamId);
        if (ctx.repoUrl() == null || ctx.repoUrl().isBlank()) {
            throw new IllegalStateException("Team " + teamId + " has no repository URL.");
        }
        enqueue(EvaluationJob.of(ctx));
        System.out.println("[EvaluationWorker] Queued team " + teamId + " for evaluation.");
    }

    /** Returns current status metadata for a team's evaluation job. */
    public Map<Object, Object> getJobStatus(String teamId) {
        Map<Object, Object> status = redisTemplate.opsForHash().entries(JOB_KEY_PREFIX + teamId);
        if (status == null || status.isEmpty()) {
            return Map.of("status", "NOT_FOUND");
        }
        return status;
    }

    // ── Worker Loop ───────────────────────────────────────────────────────────

    private void runWorkerLoop() {
        while (!Thread.currentThread().isInterrupted()) {
            try {
                // Block for up to 5 seconds waiting for a job
                Object raw = redisTemplate.opsForList().rightPop(QUEUE_KEY, 5, TimeUnit.SECONDS);
                if (raw != null) {
                    EvaluationJob job = (raw instanceof EvaluationJob ej)
                            ? ej
                            : objectMapper.convertValue(raw, EvaluationJob.class);
                    processJob(job);
                }
            } catch (Exception e) {
                System.err.println("[EvaluationWorker] Worker loop error: " + e.getMessage());
                sleepQuietly(5_000);
            }
        }
    }

    private void processJob(EvaluationJob job) {
        String teamId   = job.teamId();
        String teamName = job.context().teamName();
        int    attempt  = job.retryCount() + 1;

        System.out.printf("[EvaluationWorker] Processing team %s (%s) — attempt %d/%d%n",
                teamName, teamId, attempt, maxRetries + 1);

        // ── Stage 1: CLONING ─────────────────────────────────────────────────
        updateStatus(teamId, JobStatus.CLONING, attempt, null);
        String workspacePath;
        try {
            workspacePath = workspaceManager.cloneRepo(job.context().repoUrl(), teamId);
        } catch (WorkspaceManager.WorkspaceException e) {
            System.err.println("[EvaluationWorker] Clone failed for " + teamId + ": " + e.getMessage());
            if (e.isFatal() || job.retryCount() >= maxRetries) {
                fail(job, "Clone failed: " + e.getMessage());
            } else {
                requeue(job);
            }
            return;
        }

        // ── Stage 2: ANALYZING ───────────────────────────────────────────────
        updateStatus(teamId, JobStatus.ANALYZING, attempt, null);
        try {
            String prompt = buildPrompt(job.context());
            GeminiResult result = geminiCli.analyze(teamId, prompt);

            // ── Stage 3: COMPLETED ───────────────────────────────────────────
            updateStatus(teamId, JobStatus.COMPLETED, attempt, null);
            eventClient.reportSuccess(teamId, result);
            System.out.printf("[EvaluationWorker] ✓ Team %s scored %.1f%n", teamName, result.score());

        } catch (GeminiCliWrapper.GeminiException e) {
            System.err.println("[EvaluationWorker] Gemini failed for " + teamId + ": " + e.getMessage());
            if (job.retryCount() >= maxRetries) {
                fail(job, "Gemini analysis failed: " + e.getMessage());
                eventClient.reportError(teamId, e.getMessage());
            } else {
                requeue(job);
            }
        } finally {
            workspaceManager.cleanup(teamId);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void enqueue(EvaluationJob job) {
        try {
            redisTemplate.opsForList().leftPush(QUEUE_KEY, job);  // RedisTemplate serialises to JSON
            updateStatus(job.teamId(), JobStatus.QUEUED, 0, null);
        } catch (Exception e) {
            System.err.println("[EvaluationWorker] Failed to enqueue team " + job.teamId() + ": " + e.getMessage());
        }
    }

    private void requeue(EvaluationJob job) {
        System.out.println("[EvaluationWorker] Re-queuing team " + job.teamId() + " (retry " + (job.retryCount() + 1) + ")");
        enqueue(job.incrementRetry());
    }

    private void fail(EvaluationJob job, String reason) {
        System.err.println("[EvaluationWorker] ✗ Team " + job.teamId() + " permanently failed: " + reason);
        updateStatus(job.teamId(), JobStatus.FAILED, job.retryCount() + 1, reason);
    }

    private void updateStatus(String teamId, JobStatus status, int attempt, String error) {
        Map<String, Object> fields = new HashMap<>();
        fields.put("status",    status.name());
        fields.put("attempt",   String.valueOf(attempt));
        fields.put("updatedAt", String.valueOf(System.currentTimeMillis()));
        if (error != null) fields.put("error", error.length() > 500 ? error.substring(0, 500) + "…" : error);
        String key = JOB_KEY_PREFIX + teamId;
        redisTemplate.opsForHash().putAll(key, fields);
        redisTemplate.expire(key, JOB_TTL_HOURS, TimeUnit.HOURS);
    }

    private String buildPrompt(EvaluationContext ctx) {
        return judgePromptTemplate
                .replace("{theme}",            ctx.safeTheme())
                .replace("{problemStatement}", ctx.safeProblem())
                .replace("{requirements}",     ctx.safeRequirements());
    }

    private void sleepQuietly(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}
