package com.ehub.ai;

import org.kohsuke.github.*;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.*;

@Service
public class GithubService {

    private final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
        "java", "py", "js", "ts", "jsx", "tsx", "cpp", "c", "cs", "go", "rb", "php", "md", "txt"
    );

    private final List<String> IGNORED_DIRS = Arrays.asList(
        "node_modules", "target", "build", "dist", ".git", ".idea", ".vscode", "vendor"
    );

    public String fetchRepoContent(String repoUrl) {
        try {
            // Basic URL parsing: https://github.com/user/repo
            String path = repoUrl.replace("https://github.com/", "");
            GitHub github = new GitHubBuilder().build(); // Anonymous access (rate limited)
            GHRepository repository = github.getRepository(path);
            
            StringBuilder context = new StringBuilder();
            context.append("PROJECT STRUCTURE AND CODE:\n\n");
            
            traverseAndCollect(repository.getTreeRecursive("main", 1).getTree(), context, 0);
            
            return context.toString();
        } catch (Exception e) {
            System.err.println("GitHub Fetch Error: " + e.getMessage());
            return "Could not fetch code content: " + e.getMessage();
        }
    }

    private void traverseAndCollect(List<GHTreeEntry> entries, StringBuilder context, int depth) throws IOException {
        // Limit depth and total entries to prevent token overflow for massive repos
        if (depth > 10 || context.length() > 500000) return; 

        for (GHTreeEntry entry : entries) {
            String path = entry.getPath();
            
            // Skip ignored directories
            if (IGNORED_DIRS.stream().anyMatch(path::contains)) continue;

            if ("blob".equals(entry.getType())) {
                String extension = getExtension(path);
                if (ALLOWED_EXTENSIONS.contains(extension)) {
                    context.append("--- File: ").append(path).append(" ---\
");
                    // Fetch file content
                    String content = new String(entry.asBlob().read().readAllBytes());
                    context.append(content).append("\n\n");
                }
            }
        }
    }

    private String getExtension(String path) {
        int index = path.lastIndexOf('.');
        return (index == -1) ? "" : path.substring(index + 1).toLowerCase();
    }
}
