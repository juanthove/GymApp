package com.gymapp.dto.request.templates;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record WorkoutTemplateFullRequest(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 500) String description,
        @NotNull @NotEmpty List<@Valid DayItem> days
) {
    public record DayItem(
            @NotBlank @Size(max = 100) String name,
            @NotBlank String muscles,
            @NotNull @Min(0) Integer dayOrder,
            @NotNull List<@Valid ExerciseItem> exercises
    ) {}

    public record ExerciseItem(
            @NotNull Long exerciseId,
            @NotNull @PositiveOrZero Integer order
    ) {}
}
