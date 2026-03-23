package com.gymapp.dto.response;

import java.time.LocalDateTime;

public record WorkoutDayResponse(
        Long id,
        String name,
        String muscles,
        int dayOrder,
        String muscleImage,
        boolean abdominal,
        LocalDateTime startedAt,
        LocalDateTime finishedAt,
        String status,
        Long workoutId
) {}
