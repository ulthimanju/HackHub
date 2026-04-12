package com.ehub.ai.run;

import com.ehub.ai.run.GeminiResult;
import com.ehub.ai.run.AnalyzerPort;
import com.ehub.ai.run.GeminiCliWrapper;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GeminiAnalyzerAdapter implements AnalyzerPort {

    private final GeminiCliWrapper geminiCliWrapper;

    @Override
    public GeminiResult analyze(String teamId, String prompt) throws AnalysisException {
        try {
            return geminiCliWrapper.analyze(teamId, prompt);
        } catch (GeminiCliWrapper.GeminiException e) {
            throw new AnalysisException(e.getMessage(), e);
        }
    }
}
