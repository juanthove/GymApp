package com.gymapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record WorkoutRequest(
        @NotBlank @Size(max = 100) String name,
        @NotNull @Positive Integer reps,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotNull Long userId
) {}
