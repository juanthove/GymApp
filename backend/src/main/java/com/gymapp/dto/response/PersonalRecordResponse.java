package com.gymapp.dto.response;

import java.time.LocalDateTime;

import com.gymapp.model.MuscleType;

public record PersonalRecordResponse(
        Long id,
        Long userId,
        Long exerciseId,
        Long weight,
        LocalDateTime date,
        String name,
        MuscleType muscle,
        String icon
) {}
