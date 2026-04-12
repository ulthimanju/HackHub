package com.ehub.ai.queue;

import lombok.Data;

@Data
public class EvaluationRequestMessage {
    private String type;
    private String eventId;
    private String teamId;

    public static EvaluationRequestMessage forEvent(String eventId) {
        EvaluationRequestMessage message = new EvaluationRequestMessage();
        message.setType("EVENT");
        message.setEventId(eventId);
        return message;
    }

    public static EvaluationRequestMessage forTeam(String teamId) {
        EvaluationRequestMessage message = new EvaluationRequestMessage();
        message.setType("TEAM");
        message.setTeamId(teamId);
        return message;
    }
}