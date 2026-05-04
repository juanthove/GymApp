package com.gymapp.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UserLevelRequest(
        @NotBlank
        String name
) {}