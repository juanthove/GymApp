package com.gymapp.dto.response;

public record UserResponse(
        Long id,
        String name,
        String surname,
        boolean logged,
        Integer gymDaysPerWeek,
        String image,
        Long currentWorkoutId
) {}
