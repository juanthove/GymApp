package com.gymapp.dto.response;

import com.gymapp.model.AchievementType;
import com.gymapp.model.MuscleType;
import java.util.List;

public record AchievementResponse(
        Long id,
        String name,
        AchievementType type,
        Long levelId,
        String levelName,
        Double requiredValue,
        String image,
        MuscleType muscle,
        List<AchievementExerciseResponse> exercises) {
}