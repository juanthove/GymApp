package com.gymapp.dto.response;

import com.gymapp.model.AchievementType;
import com.gymapp.model.MuscleType;

import java.time.LocalDateTime;

public record UserAchievementResponse(
        Long id,
        String name,
        AchievementType type,
        Double requiredValue,
        MuscleType muscle,
        Long exerciseId,
        String exerciseName,
        Long levelId,
        String levelName,
        boolean unlocked,
        LocalDateTime unlockedAt,
        Double progress
) {}