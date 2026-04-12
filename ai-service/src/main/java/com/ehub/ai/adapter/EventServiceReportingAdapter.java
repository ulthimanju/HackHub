package com.ehub.ai.adapter;

import java.util.List;

import com.ehub.ai.dto.EvaluationContext;
import com.ehub.ai.model.GeminiResult;
import com.ehub.ai.port.EvaluationReportingPort;
import com.ehub.ai.service.EventServiceClient;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class EventServiceReportingAdapter implements EvaluationReportingPort {

    private final EventServiceClient eventServiceClient;

    @Override
    public EvaluationContext getTeamContext(String teamId) {
        return eventServiceClient.getTeamContext(teamId);
    }

    @Override
    public List<EvaluationContext> getEventContexts(String eventId) {
        return eventServiceClient.getEventContexts(eventId);
    }

    @Override
    public void reportSuccess(String teamId, GeminiResult result) {
        eventServiceClient.reportSuccess(teamId, result);
    }

    @Override
    public void reportError(String teamId, String reason) {
        eventServiceClient.reportError(teamId, reason);
    }
}
