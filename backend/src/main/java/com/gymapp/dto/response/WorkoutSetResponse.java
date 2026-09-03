package com.gymapp.dto.response;

import com.gymapp.model.ExerciseSide;

import java.time.LocalDateTime;

public record WorkoutSetResponse(
        Long id,
        Long userId,
        Long workoutExerciseId,
        Integer setNumber,
        Integer reps,
        Double weight,
        ExerciseSide side,
        LocalDateTime performedAt) {
}
