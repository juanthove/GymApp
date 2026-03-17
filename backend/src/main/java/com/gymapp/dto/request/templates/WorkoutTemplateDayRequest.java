package com.gymapp.dto.request.templates;

public record WorkoutTemplateDayRequest(
        String name,
        String muscles,
        Long templateId
) {}
