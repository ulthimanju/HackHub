package com.ehub.ai.reporting;

import java.util.List;

import com.ehub.ai.run.EvaluationContext;
import com.ehub.ai.run.GeminiResult;

public interface EvaluationReportingPort {
    EvaluationContext getTeamContext(String teamId);

    List<EvaluationContext> getEventContexts(String eventId);

    void reportSuccess(String teamId, GeminiResult result);

    void reportError(String teamId, String reason);
}
