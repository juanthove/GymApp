package com.gymapp.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ExerciseReminderRuleRequest(
        @NotNull Long exerciseId,
        @NotNull @Positive Integer weeks
) {}
