package com.gymapp.dto.response;

import com.gymapp.model.ExerciseType;

public record ExerciseResponse(
        Long id,
        String name,
        String description,
        ExerciseType type,
        String muscle,
        String image,
        String video,
        String icon
) {}
