package com.gymapp.dto.response;

import java.util.List;

public record WorkoutDayExercisesResponse(
    Long id,
    Integer reps,
    List<Long> selectedExerciseIds,
    List<WorkoutExerciseResponse> exercises
) {}
