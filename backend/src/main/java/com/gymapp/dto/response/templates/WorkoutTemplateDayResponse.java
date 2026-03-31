package com.gymapp.dto.response.templates;

import com.gymapp.model.MuscleType;
import java.util.Set;

public record WorkoutTemplateDayResponse(
        Long id,
        String name,
        Set<MuscleType> muscles,
        Integer dayOrder,
        String muscleImage,
        Long templateId
) {}
