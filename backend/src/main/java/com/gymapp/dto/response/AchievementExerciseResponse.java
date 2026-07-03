package com.gymapp.dto.response;

import com.gymapp.model.MuscleType;
import com.gymapp.model.ExerciseType;

public record AchievementExerciseResponse(
        Long id,
        String name,
        MuscleType muscle,
        ExerciseType type,
        String icon) {
}
