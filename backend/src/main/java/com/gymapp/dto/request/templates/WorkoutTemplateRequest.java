package com.gymapp.dto.request.templates;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WorkoutTemplateRequest(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 500) String description
) {}
