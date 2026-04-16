package com.gymapp.dto.response;

import com.gymapp.model.MuscleType;

import java.time.LocalDate;

public record WorkoutSetWeeklyMuscleVolumeResponse(
        LocalDate weekStart,
        LocalDate weekEnd,
        MuscleType muscle,
        Double volume,
        Double historicalMaxBefore
) {}
