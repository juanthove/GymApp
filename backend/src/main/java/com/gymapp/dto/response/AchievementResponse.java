package com.gymapp.dto.response;

import com.gymapp.model.AchievementType;
import com.gymapp.model.MuscleType;
import com.gymapp.model.TimeLimitType;

import java.time.LocalDate;
import java.util.List;

public record AchievementResponse(
        Long id,
        String name,
        AchievementType type,
        Long levelId,
        String levelName,
        Double requiredValue,
        String image,
        LocalDate minimumDate,
        Integer timeLimit,
        TimeLimitType timeLimitType,
        MuscleType muscle,
        List<AchievementExerciseResponse> exercises) {
}