package com.gymapp.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PersonalRecordRequest(
        @NotNull Long userId,
        @NotNull Long exerciseId,
        @NotNull @Positive Long weight
) {}
