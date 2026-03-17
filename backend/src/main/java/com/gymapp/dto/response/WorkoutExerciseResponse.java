package com.gymapp.dto.response;

public record WorkoutExerciseResponse(
        Long id,
        Long workoutDayId,
        Long exerciseId,
        String exerciseName,
        Integer exerciseOrder,
        Double weight,
        String comment,
        boolean completed
) {}
