package com.gymapp.dto.response;

import java.util.List;

public record WorkoutDaySummaryResponse(
    Long dayId,
    Double totalVolume,
    Long durationMinutes,
    List<WorkoutSetWeeklyMuscleVolumeResponse> muscleVolumes
) {}
