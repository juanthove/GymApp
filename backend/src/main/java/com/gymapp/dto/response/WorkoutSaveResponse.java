package com.gymapp.dto.response;

public record WorkoutSaveResponse(
        Long id,
        String name,
        Long workoutId) {
}
