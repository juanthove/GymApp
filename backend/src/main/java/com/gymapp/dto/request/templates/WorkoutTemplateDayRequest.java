package com.gymapp.dto.request.templates;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record WorkoutTemplateDayRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank String muscles,
        @NotNull Integer dayOrder,
        @NotNull Long templateId
) {}
