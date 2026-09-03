package com.gymapp.dto.request;

import com.gymapp.model.ExerciseSide;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record WorkoutSetRequest(
        @NotNull Long workoutExerciseId,
        @NotNull @Positive Integer setNumber,
        @NotNull @PositiveOrZero Integer reps,
        @NotNull @PositiveOrZero Double weight,
        @Positive Integer multiplier,
        ExerciseSide side) {
}
