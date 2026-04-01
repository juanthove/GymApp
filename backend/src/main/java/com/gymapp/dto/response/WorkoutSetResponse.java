package com.gymapp.dto.response;

import java.time.LocalDateTime;

public record WorkoutSetResponse(
        Long id,
        Long userId,
        Long workoutExerciseId,
        Integer setNumber,
        Integer reps,
        Double weight,
        LocalDateTime performedAt
) {}
