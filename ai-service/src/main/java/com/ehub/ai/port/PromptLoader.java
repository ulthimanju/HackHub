package com.ehub.ai.port;

import com.ehub.ai.dto.EvaluationContext;

public interface PromptLoader {
    String loadJudgePromptTemplate();

    String buildJudgePrompt(EvaluationContext context);
}
