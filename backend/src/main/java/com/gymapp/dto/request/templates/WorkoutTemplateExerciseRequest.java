package com.gymapp.dto.request.templates;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record WorkoutTemplateExerciseRequest(
        @NotNull Long templateDayId,
        @NotNull Long exerciseId,
        @NotNull @PositiveOrZero Integer exerciseOrder
) {}
