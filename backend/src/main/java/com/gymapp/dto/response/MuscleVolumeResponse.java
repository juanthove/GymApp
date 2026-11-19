package com.gymapp.dto.response;

import com.gymapp.model.MuscleType;

public record MuscleVolumeResponse(
        MuscleType muscle,
        Double volume,
        Double historicalMaxBefore) {

}
