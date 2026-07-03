package com.gymapp.dto.response;

import com.gymapp.model.AchievementType;
import com.gymapp.model.MuscleType;

import java.time.LocalDateTime;
import java.util.List;

public record UserAchievementResponse(
        Long id,
        String name,
        AchievementType type,
        Double requiredValue,
        String image,
        MuscleType muscle,
        List<AchievementExerciseResponse> exercises,
        Long levelId,
        String levelName,
        boolean unlocked,
        LocalDateTime unlockedAt,
        Double progress) {
}