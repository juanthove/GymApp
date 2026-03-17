package com.gymapp.dto.response;

import java.time.LocalDate;

public record WorkoutResponse(
        Long id,
        String name,
        Integer reps,
        LocalDate startDate,
        LocalDate endDate,
        Long userId
) {}
