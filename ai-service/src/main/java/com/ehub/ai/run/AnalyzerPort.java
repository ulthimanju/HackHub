package com.ehub.ai.run;

import com.ehub.ai.run.GeminiResult;

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
