package com.gymapp.dto.response;

import java.util.List;

public record WorkoutDaySummaryResponse(
    Long dayId,
    Double totalVolume,
    Long durationMinutes,
    int totalExercises,
    List<WorkoutSetWeeklyMuscleVolumeResponse> muscleVolumes
) {}
