package com.gymapp.dto.response;

import java.time.LocalDateTime;
import com.gymapp.model.MuscleType;
import java.util.Set;

public record WorkoutDayResponse(
        Long id,
        String name,
        Set<MuscleType> muscles,
        int dayOrder,
        String muscleImage,
        boolean abdominal,
        LocalDateTime startedAt,
        LocalDateTime finishedAt,
        String status,
        Long workoutId
) {}
