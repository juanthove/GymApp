package com.gymapp.dto.response.templates;

import java.util.List;

public record WorkoutTemplateFullResponse(
        Long id,
        String name,
        String description,
        List<DayItem> days
) {
    public record DayItem(
            Long id,
            String name,
            String muscles,
            Integer dayOrder,
            String muscleImage,
            List<ExerciseItem> exercises
    ) {}

    public record ExerciseItem(
            Long id,
            Long exerciseId,
            String exerciseName,
            Integer order
    ) {}
}
