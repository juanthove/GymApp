package com.gymapp.dto.response.templates;

public record WorkoutTemplateExerciseResponse(
        Long id,
        Long templateDayId,
        Long exerciseId,
        String exerciseName,
        Integer exerciseOrder
) {}
