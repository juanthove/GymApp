package com.gymapp.dto.request;

import java.time.LocalDate;
import java.util.List;

public record WorkoutFullRequest(
        Long userId,
        String name,
        Integer reps,
        LocalDate startDate,
        LocalDate endDate,
        List<DayItem> days
) {
    public record DayItem(
            String name,
            String muscles,
            Integer dayOrder,
            List<ExerciseItem> exercises
    ) {}

    public record ExerciseItem(
            Long exerciseId,
            Integer order,
            Double weight
    ) {}
}
