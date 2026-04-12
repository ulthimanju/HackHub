package com.ehub.ai.run;

/**
 * Strongly-typed evaluation context for a single team.
 * Replaces the previous loose Map<String, Object> to eliminate type-casting bugs.
 */
public record EvaluationContext(
        String teamId,
        String teamName,
        String repoUrl,
        String problemStatement,
        String requirements,
        String theme
) {
    /** Fallback-safe accessors — never return null for optional fields. */
    public String safeTheme()             { return theme            != null ? theme            : "General Hackathon"; }
    public String safeProblem()           { return problemStatement  != null ? problemStatement  : "No problem statement provided."; }
    public String safeRequirements()      { return requirements      != null ? requirements      : "No specific requirements provided."; }
}
