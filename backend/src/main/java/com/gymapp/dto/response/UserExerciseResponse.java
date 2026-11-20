package com.gymapp.dto.response;

public record UserExerciseResponse(
        Long id,
        Long exerciseId,
        String exerciseName,
        String muscle,
        Double weight) {
}