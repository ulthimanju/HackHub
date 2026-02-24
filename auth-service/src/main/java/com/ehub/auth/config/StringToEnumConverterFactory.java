package com.ehub.auth.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.core.convert.converter.ConverterFactory;

import java.util.Arrays;
import java.util.stream.Collectors;

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
            String readable = targetType.getSimpleName()
                    .replaceAll("([A-Z])", " $1").trim().toLowerCase();
            String validValues = Arrays.stream(targetType.getEnumConstants())
                    .map(Enum::name).collect(Collectors.joining(", "));
            throw new IllegalArgumentException(
                    "Invalid " + readable + " value: '" + value + "'. Valid values: " + validValues);
        };
    }
}
