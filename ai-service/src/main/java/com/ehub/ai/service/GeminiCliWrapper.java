package com.ehub.ai.service;

import com.ehub.ai.model.GeminiResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Bridges Java to the Gemini CLI binary that is installed in the same container.
 *
 * Authentication: the host's ~/.gemini directory is mounted at /root/.gemini (read-only)
 * via docker-compose, giving the CLI access to the cached OAuth token — no API key needed.
 *
 * Invocation pattern (mirrors the working approach from the user's prior app):
 *   ProcessBuilder pb = new ProcessBuilder("gemini", "-p", fullPrompt);
 *   pb.redirectErrorStream(true);
 *   Process process = pb.start();
 *
 * The prompt includes the @<path> file-context directive so Gemini reads the cloned repo:
 *   "...evaluate this project @/app/workspaces/{teamId}"
 *
 * Since Java's ProcessBuilder creates a non-TTY child process, the Gemini CLI detects
 * !process.stdin.isTTY and automatically runs in non-interactive mode.
 */
@Service
public class GeminiCliWrapper {

    private static final int    ANALYSIS_TIMEOUT_MINUTES = 5;
    private static final Pattern JSON_PATTERN = Pattern.compile(
            "\\{[^{}]*\"score\"[^{}]*\"summary\"[^{}]*\\}", Pattern.DOTALL);

    @Value("${application.workspace-root}")
    private String workspaceRoot;

    /**
     * Runs the Gemini CLI against the cloned repo for {@code teamId}.
     *
     * @param teamId  subdirectory name under workspaceRoot containing the cloned code
     * @param prompt  fully-rendered judge prompt (from judge_prompt.md template)
     * @return {@link GeminiResult} with score and summary
     * @throws GeminiException on timeout, non-zero exit, or unparseable output
     */
    public GeminiResult analyze(String teamId, String prompt) throws GeminiException {
        // Append @<path> so the CLI includes all files in the workspace as context
        String workspacePath = workspaceRoot.replaceAll("/$", "") + "/" + teamId;
        String fullPrompt    = prompt + " @" + workspacePath;

        // Direct invocation — gemini is on $PATH inside the container.
        // --approval-mode=yolo: auto-approve all tool calls (no interactive prompts)
        // --output-format=text: clean text output (no ANSI, no TUI chrome)
        ProcessBuilder pb = new ProcessBuilder(
                "gemini", "-p", fullPrompt, "--approval-mode=yolo", "--output-format=text");
        pb.redirectErrorStream(true); // merge stderr into stdout

        System.out.println("[GeminiCLI] Starting analysis for team: " + teamId);

        Process process;
        try {
            process = pb.start();
        } catch (IOException e) {
            throw new GeminiException("Failed to start gemini process: " + e.getMessage());
        }

        // Drain stdout/stderr in a dedicated thread (prevents pipe-buffer deadlock on large output)
        StringBuilder output = new StringBuilder();
        Thread drainer = new Thread(() -> {
            try (BufferedReader r = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = r.readLine()) != null) {
                    output.append(line).append('\n');
                    System.out.println("[GeminiCLI] " + line); // live visibility in Docker logs
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
            throw new GeminiException("Gemini CLI timed out after " + ANALYSIS_TIMEOUT_MINUTES
                    + " minutes for team: " + teamId);
        }

        int exitCode = process.exitValue();
        String rawOutput = output.toString().trim();
        System.out.println("[GeminiCLI] Finished (exit=" + exitCode + ") for team: " + teamId);

        if (exitCode != 0) {
            String snippet = rawOutput.length() > 400 ? rawOutput.substring(0, 400) + "…" : rawOutput;
            throw new GeminiException("Gemini CLI exited " + exitCode + ": " + snippet);
        }

        return parseOutput(rawOutput, teamId);
    }

    // ── Output parsing ────────────────────────────────────────────────────────

    private GeminiResult parseOutput(String raw, String teamId) throws GeminiException {
        // Try strict regex match first (handles LLM preamble/postamble)
        Matcher m = JSON_PATTERN.matcher(raw);
        if (m.find()) {
            return parseJson(m.group(), teamId);
        }
        // Fallback: extract outermost { … } block
        int start = raw.indexOf('{');
        int end   = raw.lastIndexOf('}');
        if (start != -1 && end > start) {
            return parseJson(raw.substring(start, end + 1), teamId);
        }
        throw new GeminiException("No JSON found in output for team " + teamId
                + ". Raw (truncated): " + abbreviate(raw, 300));
    }

    private GeminiResult parseJson(String json, String teamId) throws GeminiException {
        try {
            double score   = extractDouble(json, "score");
            String summary = extractString(json, "summary");
            return new GeminiResult(clamp(score), truncate(summary, 200));
        } catch (Exception e) {
            throw new GeminiException("JSON parse error for team " + teamId
                    + ": " + e.getMessage() + " | JSON: " + abbreviate(json, 200));
        }
    }

    private double extractDouble(String json, String key) {
        Matcher m = Pattern.compile("\"" + key + "\"\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)").matcher(json);
        if (!m.find()) throw new IllegalArgumentException("Missing field: " + key);
        return Double.parseDouble(m.group(1));
    }

    private String extractString(String json, String key) {
        Matcher m = Pattern.compile("\"" + key + "\"\\s*:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"").matcher(json);
        if (!m.find()) throw new IllegalArgumentException("Missing field: " + key);
        return m.group(1).replace("\\\"", "\"").replace("\\n", " ").replace("\\\\", "\\");
    }

    private double clamp(double v)       { return Math.max(0, Math.min(100, v)); }
    private String truncate(String s, int max) { return s.length() <= max ? s : s.substring(0, max - 1) + "…"; }
    private String abbreviate(String s, int max) { return s.length() <= max ? s : s.substring(0, max) + "…"; }

    // ── Exception ─────────────────────────────────────────────────────────────

    public static class GeminiException extends Exception {
        public GeminiException(String message) { super(message); }
    }
}

