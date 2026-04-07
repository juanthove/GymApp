package com.gymapp.dto.response;

import com.gymapp.model.ExerciseType;
import com.gymapp.model.MuscleType;

public record WorkoutExerciseResponse(
        Long id,
        Long workoutDayId,
        Long exerciseId,
        String exerciseName,
        MuscleType exerciseMuscle,
        ExerciseType type,
        Integer exerciseOrder,
        Double weight,
        String description,
        String comment,
        boolean completed,
        Double nextWeight,
        String image,
        String video,
        String icon,
        boolean selected

) {}
