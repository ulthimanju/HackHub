package com.ehub.ai.adapter;

import com.ehub.ai.model.GeminiResult;
import com.ehub.ai.port.AnalyzerPort;
import com.ehub.ai.service.GeminiCliWrapper;

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
