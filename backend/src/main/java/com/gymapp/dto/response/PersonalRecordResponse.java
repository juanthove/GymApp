package com.gymapp.dto.response;

import java.time.LocalDateTime;

public record PersonalRecordResponse(
        Long id,
        Long userId,
        Long exerciseId,
        Long weight,
        LocalDateTime date
) {}
