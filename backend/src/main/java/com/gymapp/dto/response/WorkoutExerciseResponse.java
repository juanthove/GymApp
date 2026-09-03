package com.gymapp.dto.response;

import java.time.LocalDate;

import com.gymapp.model.ExerciseType;
import com.gymapp.model.ExerciseMode;
import com.gymapp.model.MuscleType;

public record WorkoutExerciseResponse(
        Long id,
        Long workoutDayId,
        Long exerciseId,
        String exerciseName,
        MuscleType exerciseMuscle,
        ExerciseType type,
        ExerciseMode mode,
        Integer exerciseOrder,
        Double weight,
        String description,
        String comment,
        boolean completed,
        Double nextWeight,
        String image,
        String video,
        String icon,
        boolean selected,
        LocalDate lastPerformedDate

) {
}
