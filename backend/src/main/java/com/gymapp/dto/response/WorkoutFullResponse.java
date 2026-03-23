package com.gymapp.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record WorkoutFullResponse(
        Long id,
        String name,
        Integer reps,
        LocalDate startDate,
        LocalDate endDate,
        Long userId,
        List<DayItem> days
) {
    public record DayItem(
            Long id,
            String name,
            String muscles,
            int dayOrder,
            String muscleImage,
            boolean abdominal,
            LocalDateTime startedAt,
            LocalDateTime finishedAt,
            String status,
            List<ExerciseItem> exercises
    ) {}

    public record ExerciseItem(
            Long id,
            Long exerciseId,
            String exerciseName,
            Integer order,
            Double weight,
            String comment,
            boolean completed
    ) {}
}
