package com.ehub.ai.service;

import com.ehub.ai.model.GeminiResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Wraps the Gemini CLI running inside an ephemeral Docker container.
 *
 * Strategy:
 *   docker run --rm
 *     -v gemini-credentials:/root/.gemini:ro   ← OAuth credentials (login once)
 *     -v {workspaceVolume}:/src:ro              ← cloned repo
 *     gemini-cli:latest
 *     -p "{prompt} @/src/{teamId}"              ← -p = non-interactive prompt mode
 *
 * The @/src/{teamId} syntax tells the Gemini CLI to include all files in that
 * directory as context. No TTY is required when using the -p flag.
 */
@Service
public class GeminiCliWrapper {

    private static final int ANALYSIS_TIMEOUT_MINUTES = 5;
    private static final Pattern JSON_PATTERN = Pattern.compile("\\{[^{}]*\"score\"[^{}]*\"summary\"[^{}]*\\}", Pattern.DOTALL);

    @Value("${application.workspace-root}")
    private String workspaceRoot;

    @Value("${application.workspace-volume-name}")
    private String workspaceVolumeName;

    /**
     * Runs the Gemini CLI against the cloned repo for {@code teamId}.
     *
     * @param teamId       used to map the container path /src/{teamId}
     * @param prompt       fully-rendered judge prompt (from PromptTemplate)
     * @return {@link GeminiResult} with score and summary
     * @throws GeminiException on process failure or unparseable output
     */
    public GeminiResult analyze(String teamId, String prompt) throws GeminiException {
        // Map host path → container path (/src/{teamId})
        String containerPath = "/src/" + teamId;

        // Build the docker run command
        List<String> cmd = new ArrayList<>(List.of(
                "docker", "run", "--rm",
                "-v", "gemini-credentials:/root/.gemini:ro",
                "-v", workspaceVolumeName + ":/src:ro",
                "gemini-cli:latest",
                "-p", prompt + " @" + containerPath
        ));

        System.out.println("[GeminiCLI] Launching analysis for team: " + teamId);

        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.redirectErrorStream(true);

        Process process;
        try {
            process = pb.start();
        } catch (IOException e) {
            throw new GeminiException("Failed to start docker process: " + e.getMessage());
        }

        // Drain output in a dedicated thread to prevent pipe-buffer deadlock
        StringBuilder output = new StringBuilder();
        Thread drainer = new Thread(() -> {
            try (BufferedReader r = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = r.readLine()) != null) {
                    output.append(line).append('\n');
                }
            } catch (IOException ignored) {}
        });
        drainer.setDaemon(true);
        drainer.start();

        boolean finished;
        try {
            finished = process.waitFor(ANALYSIS_TIMEOUT_MINUTES, TimeUnit.MINUTES);
            drainer.join(5_000);
        } catch (InterruptedException e) {
            process.destroyForcibly();
            Thread.currentThread().interrupt();
            throw new GeminiException("Analysis interrupted for team: " + teamId);
        }

        if (!finished) {
            process.destroyForcibly();
            throw new GeminiException("Gemini CLI timed out after " + ANALYSIS_TIMEOUT_MINUTES + " minutes for team: " + teamId);
        }

        int exitCode = process.exitValue();
        String rawOutput = output.toString().trim();

        if (exitCode != 0) {
            String snippet = rawOutput.length() > 300 ? rawOutput.substring(0, 300) + "…" : rawOutput;
            throw new GeminiException("Gemini CLI exited with code " + exitCode + ": " + snippet);
        }

        return parseOutput(rawOutput, teamId);
    }

    /**
     * Extracts the JSON block from potentially noisy LLM output.
     * Falls back to heuristic extraction before giving up.
     */
    private GeminiResult parseOutput(String raw, String teamId) throws GeminiException {
        // Try regex match for the JSON object first (handles preamble/postamble)
        Matcher m = JSON_PATTERN.matcher(raw);
        if (m.find()) {
            return parseJson(m.group(), raw, teamId);
        }

        // Fallback: find outermost { ... } block
        int start = raw.indexOf('{');
        int end   = raw.lastIndexOf('}');
        if (start != -1 && end > start) {
            return parseJson(raw.substring(start, end + 1), raw, teamId);
        }

        throw new GeminiException("No JSON found in Gemini output for team " + teamId + ". Raw: " + abbreviate(raw, 300));
    }

    private GeminiResult parseJson(String json, String raw, String teamId) throws GeminiException {
        try {
            // Simple manual parse to avoid Jackson dependency in wrapper — fields are always scalar
            double score   = extractDouble(json, "score");
            String summary = extractString(json, "summary");
            return new GeminiResult(clamp(score), truncate(summary, 200));
        } catch (Exception e) {
            throw new GeminiException("JSON parse error for team " + teamId + ": " + e.getMessage() + " | JSON: " + abbreviate(json, 200));
        }
    }

    private double extractDouble(String json, String key) {
        Pattern p = Pattern.compile("\"" + key + "\"\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)");
        Matcher m = p.matcher(json);
        if (!m.find()) throw new IllegalArgumentException("Missing field: " + key);
        return Double.parseDouble(m.group(1));
    }

    private String extractString(String json, String key) {
        Pattern p = Pattern.compile("\"" + key + "\"\\s*:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"");
        Matcher m = p.matcher(json);
        if (!m.find()) throw new IllegalArgumentException("Missing field: " + key);
        return m.group(1).replace("\\\"", "\"").replace("\\n", " ").replace("\\\\", "\\");
    }

    private double clamp(double score) { return Math.max(0, Math.min(100, score)); }
    private String truncate(String s, int max) { return s.length() <= max ? s : s.substring(0, max - 1) + "…"; }
    private String abbreviate(String s, int max) { return s.length() <= max ? s : s.substring(0, max) + "…"; }

    // ── Exception ─────────────────────────────────────────────────────────────

    public static class GeminiException extends Exception {
        public GeminiException(String message) { super(message); }
    }
}
