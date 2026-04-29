package com.gymapp.dto.response;

import com.gymapp.model.MuscleType;

public record WorkoutDayMuscleVolumeResponse(
    MuscleType muscle,
    Double volume
) {}
