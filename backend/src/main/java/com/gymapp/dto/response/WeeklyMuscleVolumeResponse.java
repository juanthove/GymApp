package com.gymapp.dto.response;

import java.time.LocalDate;
import java.util.List;

public record WeeklyMuscleVolumeResponse(
        LocalDate weekStart,
        LocalDate weekEnd,
        Double totalVolume,
        List<MuscleVolumeResponse> muscles) {
}
