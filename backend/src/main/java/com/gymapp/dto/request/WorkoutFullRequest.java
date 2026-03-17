package com.gymapp.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

public record WorkoutFullRequest(
        @NotNull Long userId,
        @NotBlank @Size(max = 100) String name,
        @NotNull @Positive Integer reps,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotNull @NotEmpty List<@Valid DayItem> days
) {
    public record DayItem(
            @NotBlank @Size(max = 100) String name,
            @NotBlank String muscles,
            @NotNull @PositiveOrZero Integer dayOrder,
            @NotNull List<@Valid ExerciseItem> exercises
    ) {}

    public record ExerciseItem(
            @NotNull Long exerciseId,
            @NotNull @PositiveOrZero Integer order,
            @PositiveOrZero Double weight
    ) {}
}
