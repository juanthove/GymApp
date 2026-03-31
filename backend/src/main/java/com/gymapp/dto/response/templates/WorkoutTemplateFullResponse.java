package com.gymapp.dto.response.templates;

import java.util.List;
import com.gymapp.model.MuscleType;
import java.util.Set;

public record WorkoutTemplateFullResponse(
        Long id,
        String name,
        String description,
        List<DayItem> days
) {
    public record DayItem(
            Long id,
            String name,
            Set<MuscleType> muscles,
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
