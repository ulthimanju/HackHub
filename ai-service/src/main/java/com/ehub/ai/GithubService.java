package com.ehub.ai;

import org.kohsuke.github.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class GithubService {

    // Gemini 2.0 Flash supports ~1M tokens (~750KB text). Leave headroom for the prompt itself.
    private static final int GEMINI_MAX_CHARS = 700_000;

    // Whitelist: only raw source code and docs — compiled/binary files are excluded by definition
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
        "java", "py", "js", "ts", "jsx", "tsx", "cpp", "c", "h", "cs", "go",
        "rb", "php", "rs", "kt", "swift", "scala", "r", "sql", "sh", "md", "txt", "yaml", "yml", "json", "xml", "html", "css"
    );

    // Directories that contain compiled output, dependencies, or generated files — never useful for evaluation
    private static final List<String> IGNORED_DIRS = Arrays.asList(
        // Dependency managers
        "node_modules", "vendor", ".gradle", ".m2", "bower_components",
        // Build output
        "target", "build", "dist", "out", "bin", "obj", ".next", ".nuxt",
        "release", "debug", "__pycache__", ".pytest_cache", ".eggs", "*.egg-info",
        // IDE / tooling
        ".git", ".idea", ".vscode", ".eclipse", ".settings",
        // Coverage / generated
        "coverage", ".nyc_output", "generated", "gen", "migrations"
    );

    // Specific filenames to skip regardless of extension (lock files, compiled manifests, etc.)
    private static final Set<String> IGNORED_FILENAMES = new HashSet<>(Arrays.asList(
        "package-lock.json", "yarn.lock", "pom.xml.versionsBackup",
        "Gemfile.lock", "Cargo.lock", "poetry.lock", "composer.lock",
        "gradlew", "gradlew.bat", "mvnw", "mvnw.cmd"
    ));

    @Value("${GITHUB_TOKEN:}")
    private String githubToken;

    public String fetchRepoContent(String repoUrl) {
        try {
            String path = repoUrl.replace("https://github.com/", "").replaceAll("/$", "");

            GitHub github = (githubToken != null && !githubToken.isBlank())
                    ? new GitHubBuilder().withOAuthToken(githubToken).build()
                    : new GitHubBuilder().build();

            GHRepository repository = github.getRepository(path);
            String defaultBranch = repository.getDefaultBranch();

            List<GHTreeEntry> allEntries = repository.getTreeRecursive(defaultBranch, 1).getTree();

            // Always show full file tree so Gemini understands complete project scope
            StringBuilder context = new StringBuilder();
            context.append("=== FULL PROJECT FILE TREE (source files only) ===\n");
            allEntries.stream()
                .filter(e -> "blob".equals(e.getType()))
                .filter(e -> IGNORED_DIRS.stream().noneMatch(e.getPath()::contains))
                .filter(e -> {
                    String fname = e.getPath().contains("/")
                        ? e.getPath().substring(e.getPath().lastIndexOf('/') + 1) : e.getPath();
                    return !IGNORED_FILENAMES.contains(fname);
                })
                .filter(e -> ALLOWED_EXTENSIONS.contains(getExtension(e.getPath())))
                .forEach(e -> context.append(e.getPath())
                    .append(" (").append(e.getSize()).append(" bytes)\n"));
            context.append("\n=== SOURCE CODE ===\n\n");

            // Collect ALL files — no size limit during collection
            collectFiles(allEntries, context, true);  // README first
            collectFiles(allEntries, context, false); // then everything else

            // Only truncate if we exceed Gemini's context window
            if (context.length() > GEMINI_MAX_CHARS) {
                String truncated = context.substring(0, GEMINI_MAX_CHARS);
                return truncated +
                    "\n\n[... CONTENT TRUNCATED: total repo content exceeded Gemini's context limit (" +
                    GEMINI_MAX_CHARS / 1000 + "KB). The above is the maximum that can be evaluated. " +
                    "Files listed in the project tree but not fully included should still be " +
                    "considered when assessing completeness. ...]";
            }

            return context.toString();
        } catch (Exception e) {
            System.err.println("GitHub Fetch Error: " + e.getMessage());
            return "Could not fetch code content: " + e.getMessage();
        }
    }

    private void collectFiles(List<GHTreeEntry> entries, StringBuilder context, boolean readmeOnly) {
        for (GHTreeEntry entry : entries) {
            if (!"blob".equals(entry.getType())) continue;

            String path = entry.getPath();

            // Skip any path segment that's a known ignored directory
            if (IGNORED_DIRS.stream().anyMatch(path::contains)) continue;

            // Skip specific filenames (lock files, wrapper scripts, etc.)
            String filename = path.contains("/") ? path.substring(path.lastIndexOf('/') + 1) : path;
            if (IGNORED_FILENAMES.contains(filename)) continue;

            boolean isReadme = filename.toLowerCase().contains("readme");
            if (readmeOnly != isReadme) continue;

            if (!ALLOWED_EXTENSIONS.contains(getExtension(path))) continue;

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
