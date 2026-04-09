package com.gymapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PhraseRequest(
        @NotBlank
        @Size(max = 500)
        String text
) {}