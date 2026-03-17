package com.gymapp.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record WorkoutExerciseRequest(
        @NotNull Long workoutDayId,
        @NotNull Long exerciseId,
        @NotNull @PositiveOrZero Integer exerciseOrder,
        @PositiveOrZero Double weight,
        @Size(max = 500) String comment
) {}
