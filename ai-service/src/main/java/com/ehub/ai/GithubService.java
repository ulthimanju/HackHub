package com.ehub.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

@Service
public class GithubService {

    private static final int FETCH_TIMEOUT_SECONDS = 120;

    @Value("${GITHUB_TOKEN:}")
    private String githubToken;

    @Value("${WORKSPACE_ROOT:/app/workspaces}")
    private String workspaceRoot;

    public String cloneRepoToWorkspace(String repoUrl, String teamId) throws Exception {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<String> future = executor.submit(() -> doClone(repoUrl, teamId));
        try {
            return future.get(FETCH_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            future.cancel(true);
            throw new RuntimeException("Repository clone timed out after " + FETCH_TIMEOUT_SECONDS + "s for: " + repoUrl);
        } finally {
            executor.shutdownNow();
        }
    }

    private String doClone(String repoUrl, String teamId) throws Exception {
        Path workspacesPath = Paths.get(workspaceRoot);
        if (!Files.exists(workspacesPath)) {
            Files.createDirectories(workspacesPath);
        }

        Path teamWorkspace = workspacesPath.resolve(teamId);
        if (Files.exists(teamWorkspace)) {
            deleteRecursively(teamWorkspace);
        }
        Files.createDirectories(teamWorkspace);

        String cloneUrl = buildCloneUrl(repoUrl);
        System.out.println("Cloning team " + teamId + " repo: " + repoUrl);
        runCommand(teamWorkspace, "git", "clone", "--depth", "1", "--quiet", cloneUrl, ".");

        return teamWorkspace.toAbsolutePath().toString();
    }

    /** Injects the GitHub token into the clone URL for private repositories. */
    private String buildCloneUrl(String repoUrl) {
        String token = (githubToken != null) ? githubToken.strip() : "";
        if (!token.isBlank() && repoUrl.startsWith("https://github.com/")) {
            return repoUrl.replace("https://github.com/", "https://" + token + "@github.com/");
        }
        return repoUrl;
    }

    /**
     * Runs a subprocess, draining its output in a parallel thread to prevent
     * pipe-buffer deadlock on large output. Throws RuntimeException if exit code != 0.
     */
    private void runCommand(Path workDir, String... command) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(List.of(command))
            .directory(workDir.toFile())
            .redirectErrorStream(true); // merge stderr → stdout
        pb.environment().put("GIT_TERMINAL_PROMPT", "0"); // prevent interactive credential prompts

        Process process = pb.start();

        StringBuilder output = new StringBuilder();
        Thread gobbler = new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append('\n');
                }
            } catch (IOException ignored) {}
        });
        gobbler.setDaemon(true);
        gobbler.start();

        int exitCode = process.waitFor();
        gobbler.join(5_000);

        if (exitCode != 0) {
            String snippet = output.length() > 500 ? output.substring(0, 500) + "..." : output.toString();
            throw new RuntimeException(
                "Command failed (exit " + exitCode + "): " + String.join(" ", command) + "\n" + snippet);
        }
    }

    /** Deletes a workspace directory after evaluation is complete. */
    public void cleanupWorkspace(String workspacePath) {
        if (workspacePath != null) {
            deleteRecursively(Paths.get(workspacePath));
        }
    }

    private void deleteRecursively(Path dir) {
        try {
            Files.walk(dir)
                .sorted(Comparator.reverseOrder())
                .map(Path::toFile)
                .forEach(File::delete);
        } catch (IOException e) {
            System.err.println("Failed to clean up temp dir " + dir + ": " + e.getMessage());
        }
    }
}

