package com.gymapp.dto.response;

public record WorkoutSetResponse(
        Long id,
        Long userId,
        Long workoutExerciseId,
        Integer setNumber,
        Integer reps,
        Double weight
) {}
