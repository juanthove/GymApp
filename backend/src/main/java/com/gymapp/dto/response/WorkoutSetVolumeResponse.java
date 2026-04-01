package com.gymapp.dto.response;

import java.time.LocalDate;

public record WorkoutSetVolumeResponse(
        Long userId,
        LocalDate from,
        LocalDate to,
        Double totalVolume
) {}
