package com.gymapp.dto.request;

public record WorkoutExerciseRequest(
        Long workoutDayId,
        Long exerciseId,
        Integer exerciseOrder,
        Double weight,
        String comment
) {}
