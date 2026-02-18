package com.ehub.ai;

import org.kohsuke.github.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class GithubService {

    private static final int PER_FILE_LIMIT = 15_000; // 15KB per file
    private static final int TOTAL_LIMIT    = 30_000; // 30KB total context

    private final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
        "java", "py", "js", "ts", "jsx", "tsx", "cpp", "c", "cs", "go", "rb", "php", "md", "txt"
    );

    private final List<String> IGNORED_DIRS = Arrays.asList(
        "node_modules", "target", "build", "dist", ".git", ".idea", ".vscode", "vendor"
    );

    @Value("${GITHUB_TOKEN:}")
    private String githubToken;

    public String fetchRepoContent(String repoUrl) {
        try {
            String path = repoUrl.replace("https://github.com/", "").replaceAll("/$", "");

            // Use authenticated access (5000 req/hr) if token provided, else anonymous (60 req/hr)
            GitHub github = (githubToken != null && !githubToken.isBlank())
                    ? new GitHubBuilder().withOAuthToken(githubToken).build()
                    : new GitHubBuilder().build();

            GHRepository repository = github.getRepository(path);
            String defaultBranch = repository.getDefaultBranch(); // never hardcode "main"

            StringBuilder context = new StringBuilder("PROJECT STRUCTURE AND CODE:\n\n");
            List<GHTreeEntry> entries = repository.getTreeRecursive(defaultBranch, 1).getTree();

            // Pass 1: README files first so Gemini understands project intent
            collectFiles(entries, context, true);
            // Pass 2: source code files
            collectFiles(entries, context, false);

            return context.toString();
        } catch (Exception e) {
            System.err.println("GitHub Fetch Error: " + e.getMessage());
            return "Could not fetch code content: " + e.getMessage();
        }
    }

    private void collectFiles(List<GHTreeEntry> entries, StringBuilder context, boolean readmeOnly) {
        for (GHTreeEntry entry : entries) {
            if (context.length() >= TOTAL_LIMIT) return;
            if (!"blob".equals(entry.getType())) continue;

            String path = entry.getPath();
            if (IGNORED_DIRS.stream().anyMatch(path::contains)) continue;

            boolean isReadme = path.toLowerCase().contains("readme");
            if (readmeOnly != isReadme) continue;

            if (!ALLOWED_EXTENSIONS.contains(getExtension(path))) continue;
            if (entry.getSize() > PER_FILE_LIMIT) continue; // skip large files

            try {
                String content = new String(entry.asBlob().read().readAllBytes());
                context.append("--- File: ").append(path).append(" ---\n");
                context.append(content).append("\n\n");
            } catch (Exception e) {
                System.err.println("Could not read file " + path + ": " + e.getMessage());
            }
        }
    }

    private String getExtension(String path) {
        int index = path.lastIndexOf('.');
        return (index == -1) ? "" : path.substring(index + 1).toLowerCase();
    }
}
