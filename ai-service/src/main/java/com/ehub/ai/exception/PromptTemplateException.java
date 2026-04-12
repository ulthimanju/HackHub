package com.ehub.ai.exception;

public class PromptTemplateException extends IllegalStateException {
    public PromptTemplateException(String message, Throwable cause) {
        super(message, cause);
    }
}
