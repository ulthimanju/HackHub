package com.ehub.ai.adapter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.core.io.ClassPathResource;

import com.ehub.ai.dto.EvaluationContext;
import com.ehub.ai.exception.PromptTemplateException;
import com.ehub.ai.port.PromptLoader;

public class ClasspathPromptLoader implements PromptLoader {

    private static final String TEMPLATE_PATH = "templates/judge_prompt.md";

    @Override
    public String loadJudgePromptTemplate() {
        ClassPathResource resource = new ClassPathResource(TEMPLATE_PATH);
        try {
            return resource.getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new PromptTemplateException("Failed to load judge prompt template", e);
        }
    }

    @Override
    public String buildJudgePrompt(EvaluationContext context) {
        return loadJudgePromptTemplate()
                .replace("{theme}", context.safeTheme())
                .replace("{problemStatement}", context.safeProblem())
                .replace("{requirements}", context.safeRequirements());
    }
}
