package com.ehub.ai.port;

import com.ehub.ai.model.GeminiResult;

public interface AnalyzerPort {
    GeminiResult analyze(String teamId, String prompt) throws AnalysisException;

    class AnalysisException extends Exception {
        public AnalysisException(String message) {
            super(message);
        }

        public AnalysisException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
