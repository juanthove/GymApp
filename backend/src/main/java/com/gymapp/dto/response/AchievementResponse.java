package com.gymapp.dto.response;

import com.gymapp.model.AchievementType;
import com.gymapp.model.MuscleType;

public record AchievementResponse(
        Long id,
        String name,
        AchievementType type,
        Long levelId,
        String levelName,
        Double requiredValue,
        MuscleType muscle,
        Long exerciseId,
        String exerciseName
) {}