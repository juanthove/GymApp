package com.gymapp.dto.request;

public record WorkoutDayRequest(
        String name,
        String muscles,
        Integer dayOrder,
        Long workoutId
) {}
