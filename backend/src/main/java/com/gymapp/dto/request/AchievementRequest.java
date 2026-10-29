package com.gymapp.dto.request;

import com.gymapp.model.AchievementType;
import com.gymapp.model.MuscleType;
import com.gymapp.model.TimeLimitType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.util.List;

public record AchievementRequest(
        @NotBlank String name,
        @NotNull AchievementType type,
        Long levelId,
        @Positive Double requiredValue,

        LocalDate minimumDate,
        @Positive Integer timeLimit,
        TimeLimitType timeLimitType,

        MuscleType muscle,
        @NotNull List<Long> exerciseIds) {
}