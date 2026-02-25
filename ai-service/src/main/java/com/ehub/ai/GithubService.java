package com.ehub.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

@Service
public class GithubService {

    // Groq free-tier TPM limit for llama-3.3-70b-versatile is ~12K — keep content under ~30KB
    private static final int MAX_CHARS = 30_000;
    private static final int FETCH_TIMEOUT_SECONDS = 120;
    private static final String REPOMIX_CONFIG_PATH = "/app/repomix.config.json";

    @Value("${GITHUB_TOKEN:}")
    private String githubToken;

    public String fetchRepoContent(String repoUrl) throws Exception {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<String> future = executor.submit(() -> doFetch(repoUrl));
        try {
            return future.get(FETCH_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            future.cancel(true);
            throw new RuntimeException("Repository fetch timed out after " + FETCH_TIMEOUT_SECONDS + "s for: " + repoUrl);
        } finally {
            executor.shutdownNow();
        }
    }

    private String doFetch(String repoUrl) throws Exception {
        Path tmpDir = Files.createTempDirectory("ehub-repo-");
        try {
            Path cloneDir  = tmpDir.resolve("repo");
            Path outputFile = tmpDir.resolve("bundled.txt");

            // Step 1: Shallow clone (depth=1 keeps it fast, avoids full history)
            String cloneUrl = buildCloneUrl(repoUrl);
            System.out.println("Cloning: " + repoUrl);
            runCommand(tmpDir, "git", "clone", "--depth", "1", "--quiet", cloneUrl, cloneDir.toString());

            // Step 2: Bundle with repomix
            System.out.println("Running repomix...");
            List<String> repomixCmd = new ArrayList<>(List.of("repomix"));
            if (Files.exists(Path.of(REPOMIX_CONFIG_PATH))) {
                repomixCmd.addAll(List.of("--config", REPOMIX_CONFIG_PATH));
            }
            repomixCmd.addAll(List.of("--output", outputFile.toString(), cloneDir.toString()));
            runCommand(tmpDir, repomixCmd.toArray(String[]::new));

            // Step 3: Read and truncate to keep within LLM token budget
            String content = Files.readString(outputFile);
            System.out.println("Bundle size: " + content.length() + " chars.");

            if (content.length() > MAX_CHARS) {
                return content.substring(0, MAX_CHARS)
                    + "\n\n[... CONTENT TRUNCATED at 30KB. Review the repository directly for full context. ...]";
            }
            return content;

        } finally {
            deleteRecursively(tmpDir);
        }
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

