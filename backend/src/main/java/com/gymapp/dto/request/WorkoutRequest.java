package com.gymapp.dto.request;

import java.time.LocalDate;

public record WorkoutRequest(
        String name,
        Integer reps,
        LocalDate startDate,
        LocalDate endDate,
        Long userId
) {}
