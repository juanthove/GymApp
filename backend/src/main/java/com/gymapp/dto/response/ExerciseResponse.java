package com.gymapp.dto.response;

import com.gymapp.model.ExerciseType;
import com.gymapp.model.MuscleType;

public record ExerciseResponse(
        Long id,
        String name,
        String description,
        ExerciseType type,
        MuscleType muscle,
        String image,
        String video,
        String icon
) {}
