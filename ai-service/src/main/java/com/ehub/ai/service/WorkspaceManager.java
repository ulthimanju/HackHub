package com.ehub.ai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.*;

/**
 * Manages the on-disk lifecycle of a cloned repository:
 *   Clone → Verify → (evaluation runs) → Cleanup
 *
 * All Git errors are surfaced as descriptive RuntimeExceptions so the
 * EvaluationWorker can classify them (auth failure, repo not found, timeout).
 */
@Service
public class WorkspaceManager {

    private static final int CLONE_TIMEOUT_SECONDS = 120;

    @Value("${application.workspace-root}")
    private String workspaceRoot;

    @Value("${application.github-token:}")
    private String githubToken;

    /**
     * Shallow-clones {@code repoUrl} into {@code {workspaceRoot}/{teamId}}.
     *
     * @return absolute path to the cloned directory
     * @throws WorkspaceException on any git or IO failure
     */
    public String cloneRepo(String repoUrl, String teamId) throws WorkspaceException {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<String> future = executor.submit(() -> doClone(repoUrl, teamId));
        try {
            return future.get(CLONE_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            future.cancel(true);
            throw new WorkspaceException("Clone timed out after " + CLONE_TIMEOUT_SECONDS + "s for: " + repoUrl, ErrorKind.TIMEOUT);
        } catch (ExecutionException e) {
            Throwable cause = e.getCause();
            if (cause instanceof WorkspaceException we) throw we;
            throw new WorkspaceException("Clone failed: " + cause.getMessage(), ErrorKind.GIT_ERROR);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new WorkspaceException("Clone interrupted", ErrorKind.GIT_ERROR);
        } finally {
            executor.shutdownNow();
        }
    }

    /** Removes the workspace directory for {@code teamId}. Safe to call even if the directory is missing. */
    public void cleanup(String teamId) {
        Path dir = Paths.get(workspaceRoot, teamId);
        deleteRecursively(dir);
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    private String doClone(String repoUrl, String teamId) throws WorkspaceException {
        Path workspacesDir = Paths.get(workspaceRoot);
        try {
            Files.createDirectories(workspacesDir);
        } catch (IOException e) {
            throw new WorkspaceException("Cannot create workspace root: " + e.getMessage(), ErrorKind.IO_ERROR);
        }

        Path teamDir = workspacesDir.resolve(teamId);
        if (Files.exists(teamDir)) {
            deleteRecursively(teamDir);
        }
        try {
            Files.createDirectories(teamDir);
        } catch (IOException e) {
            throw new WorkspaceException("Cannot create team directory: " + e.getMessage(), ErrorKind.IO_ERROR);
        }

        String cloneUrl = injectToken(repoUrl);
        String output = runCommand(teamDir, "git", "clone", "--depth", "1", "--quiet", cloneUrl, ".");

        // Verify: at minimum one file must exist after cloning
        try {
            boolean hasContent = Files.list(teamDir).findFirst().isPresent();
            if (!hasContent) {
                throw new WorkspaceException("Repository appears to be empty: " + repoUrl, ErrorKind.EMPTY_REPO);
            }
        } catch (IOException e) {
            throw new WorkspaceException("Failed to verify clone: " + e.getMessage(), ErrorKind.IO_ERROR);
        }

        return teamDir.toAbsolutePath().toString();
    }

    private String injectToken(String repoUrl) {
        String token = githubToken != null ? githubToken.strip() : "";
        if (!token.isBlank() && repoUrl.startsWith("https://github.com/")) {
            return repoUrl.replace("https://github.com/", "https://" + token + "@github.com/");
        }
        return repoUrl;
    }

    /**
     * Runs a subprocess with merged stdout/stderr, draining output in a parallel
     * thread to prevent pipe-buffer deadlock. Throws WorkspaceException on non-zero exit.
     */
    private String runCommand(Path workDir, String... command) throws WorkspaceException {
        ProcessBuilder pb = new ProcessBuilder(List.of(command))
                .directory(workDir.toFile())
                .redirectErrorStream(true);
        pb.environment().put("GIT_TERMINAL_PROMPT", "0");

        Process process;
        try {
            process = pb.start();
        } catch (IOException e) {
            throw new WorkspaceException("Failed to start git: " + e.getMessage(), ErrorKind.GIT_ERROR);
        }

        StringBuilder output = new StringBuilder();
        Thread gobbler = new Thread(() -> {
            try (BufferedReader r = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = r.readLine()) != null) output.append(line).append('\n');
            } catch (IOException ignored) {}
        });
        gobbler.setDaemon(true);
        gobbler.start();

        int exitCode;
        try {
            exitCode = process.waitFor();
            gobbler.join(5_000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new WorkspaceException("Git command interrupted", ErrorKind.GIT_ERROR);
        }

        String out = output.toString();
        if (exitCode != 0) {
            ErrorKind kind = classifyGitError(out, exitCode);
            String snippet = out.length() > 400 ? out.substring(0, 400) + "…" : out;
            throw new WorkspaceException("git " + command[1] + " failed (exit " + exitCode + "): " + snippet, kind);
        }
        return out;
    }

    private ErrorKind classifyGitError(String output, int exitCode) {
        String lower = output.toLowerCase();
        if (lower.contains("repository not found") || lower.contains("does not exist") || exitCode == 128) {
            return ErrorKind.REPO_NOT_FOUND;
        }
        if (lower.contains("authentication") || lower.contains("403") || lower.contains("401")) {
            return ErrorKind.AUTH_FAILURE;
        }
        if (lower.contains("rate limit")) {
            return ErrorKind.RATE_LIMITED;
        }
        return ErrorKind.GIT_ERROR;
    }

    private void deleteRecursively(Path dir) {
        if (!Files.exists(dir)) return;
        try {
            Files.walk(dir)
                    .sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
        } catch (IOException e) {
            System.err.println("[WorkspaceManager] Failed to delete " + dir + ": " + e.getMessage());
        }
    }

    // ── Exception ─────────────────────────────────────────────────────────────

    public enum ErrorKind {
        REPO_NOT_FOUND, AUTH_FAILURE, RATE_LIMITED, TIMEOUT, EMPTY_REPO, IO_ERROR, GIT_ERROR
    }

    public static class WorkspaceException extends Exception {
        private final ErrorKind kind;

        public WorkspaceException(String message, ErrorKind kind) {
            super(message);
            this.kind = kind;
        }

        public ErrorKind getKind() { return kind; }

        /** True if retrying is unlikely to help (repo missing, auth failure). */
        public boolean isFatal() {
            return kind == ErrorKind.REPO_NOT_FOUND
                    || kind == ErrorKind.AUTH_FAILURE
                    || kind == ErrorKind.EMPTY_REPO;
        }
    }
}
