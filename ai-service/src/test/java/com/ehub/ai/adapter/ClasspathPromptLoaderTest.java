package com.ehub.ai.adapter;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.ehub.ai.run.ClasspathPromptLoader;
import com.ehub.ai.run.EvaluationContext;

class ClasspathPromptLoaderTest {

    @Test
    void buildJudgePrompt_replacesTemplatePlaceholders() {
        ClasspathPromptLoader loader = new ClasspathPromptLoader();
        EvaluationContext context = new EvaluationContext("t1", "Team One", "https://github.com/x/y",
                "A smart assistant", "Must be secure", "AI for good");

        String prompt = loader.buildJudgePrompt(context);

        assertTrue(prompt.contains("AI for good"));
        assertTrue(prompt.contains("A smart assistant"));
        assertTrue(prompt.contains("Must be secure"));
    }

    @Test
    void loadJudgePromptTemplate_readsClasspathResource() {
        ClasspathPromptLoader loader = new ClasspathPromptLoader();

        String template = loader.loadJudgePromptTemplate();

        assertTrue(template.contains("HACKATHON CONTEXT"));
        assertTrue(template.contains("{theme}"));
    }
}
