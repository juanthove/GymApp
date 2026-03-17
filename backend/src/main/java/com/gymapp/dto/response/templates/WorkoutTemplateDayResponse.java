package com.gymapp.dto.response.templates;

public record WorkoutTemplateDayResponse(
        Long id,
        String name,
        String muscles,
        Long templateId
) {}
