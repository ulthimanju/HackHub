package com.ehub.ai.run;

import com.ehub.ai.run.EvaluationContext;

public interface PromptLoader {
    String loadJudgePromptTemplate();

    String buildJudgePrompt(EvaluationContext context);
}
