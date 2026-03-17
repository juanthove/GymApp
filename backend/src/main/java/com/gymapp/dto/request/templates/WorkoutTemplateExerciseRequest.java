package com.gymapp.dto.request.templates;

public record WorkoutTemplateExerciseRequest(
        Long templateDayId,
        Long exerciseId,
        Integer exerciseOrder
) {}
