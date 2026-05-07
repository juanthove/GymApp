package com.gymapp.dto.response;

import com.gymapp.model.AchievementType;
import com.gymapp.model.MuscleType;

import java.time.LocalDateTime;

public record UserAchievementResponse(
        Long id,
        String name,
        AchievementType type,
        Double requiredValue,
        String image,
        MuscleType muscle,
        Long exerciseId,
        String exerciseName,
        MuscleType exerciseMuscle,
        Long levelId,
        String levelName,
        boolean unlocked,
        LocalDateTime unlockedAt,
        Double progress) {
}