package com.gymapp.dto.request;

import com.gymapp.model.AchievementType;
import com.gymapp.model.MuscleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AchievementRequest(
        @NotBlank
        String name,
        @NotNull
        AchievementType type,
        Long levelId,
        @Positive
        Double requiredValue,
        MuscleType muscle,
        Long exerciseId
) {}