package com.gymapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record WorkoutSaveRequest(
        @NotBlank @Size(max = 100) String name,
        @NotNull Long workoutId) {
}
