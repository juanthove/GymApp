package com.gymapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record WorkoutDayRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank String muscles,
        @NotNull @PositiveOrZero Integer dayOrder,
        @NotNull Long workoutId
) {}
