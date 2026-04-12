package com.ehub.ai.port;

import java.util.List;

import com.ehub.ai.dto.EvaluationContext;
import com.ehub.ai.model.GeminiResult;

public interface EvaluationReportingPort {
    EvaluationContext getTeamContext(String teamId);

    List<EvaluationContext> getEventContexts(String eventId);

    void reportSuccess(String teamId, GeminiResult result);

    void reportError(String teamId, String reason);
}
