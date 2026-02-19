package com.ehub.auth.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.core.convert.converter.ConverterFactory;

public class StringToEnumConverterFactory implements ConverterFactory<String, Enum> {

    @Override
    @SuppressWarnings({"unchecked", "rawtypes"})
    public <T extends Enum> Converter<String, T> getConverter(Class<T> targetType) {
        return value -> {
            for (T constant : targetType.getEnumConstants()) {
                if (constant.name().equalsIgnoreCase(value.trim())) {
                    return constant;
                }
            }
            throw new IllegalArgumentException(
                "No enum constant '" + value + "' for " + targetType.getSimpleName());
        };
    }
}
