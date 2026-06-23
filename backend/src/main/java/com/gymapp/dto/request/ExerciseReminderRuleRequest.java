package com.gymapp.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record ExerciseReminderRuleRequest(
        @NotNull String name,
        @NotNull List<Long> exerciseIds,
        @NotNull @Positive Integer weeks) {
}
