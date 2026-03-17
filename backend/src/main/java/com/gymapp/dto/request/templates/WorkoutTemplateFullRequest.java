package com.gymapp.dto.request.templates;

import java.util.List;

public record WorkoutTemplateFullRequest(
        String name,
        String description,
        List<DayItem> days
) {
    public record DayItem(
            String name,
            String muscles,
            List<ExerciseItem> exercises
    ) {}

    public record ExerciseItem(
            Long exerciseId,
            Integer order
    ) {}
}
