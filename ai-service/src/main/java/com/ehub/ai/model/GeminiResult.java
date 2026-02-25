package com.ehub.ai.model;

/**
 * Immutable result from the Gemini CLI analysis.
 */
public record GeminiResult(double score, String summary) {

    public static GeminiResult error(String reason) {
        String truncated = reason.length() > 197 ? reason.substring(0, 197) + "..." : reason;
        return new GeminiResult(0.0, "EVAL_ERROR: " + truncated);
    }
}
