package com.gymapp.dto.response;

import com.gymapp.model.ExerciseType;

public record WorkoutExerciseResponse(
        Long id,
        Long workoutDayId,
        Long exerciseId,
        String exerciseName,
        ExerciseType type,
        Integer exerciseOrder,
        Double weight,
        String comment,
        boolean completed,
        String image,
        String video,
        boolean selected

) {}
