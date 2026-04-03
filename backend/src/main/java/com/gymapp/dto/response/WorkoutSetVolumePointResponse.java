package com.gymapp.dto.response;

import java.time.LocalDate;

public record WorkoutSetVolumePointResponse(
        LocalDate date,
        Double volume
) {}