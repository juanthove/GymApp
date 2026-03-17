package com.gymapp.service.templates;

import com.gymapp.model.templates.WorkoutTemplateExercise;

import java.util.List;
import java.util.Optional;

public interface WorkoutTemplateExerciseService {

    List<WorkoutTemplateExercise> getAllTemplateExercises();

    Optional<WorkoutTemplateExercise> getTemplateExerciseById(Long id);

    List<WorkoutTemplateExercise> getExercisesByTemplateDay(Long dayId);

    WorkoutTemplateExercise createTemplateExercise(WorkoutTemplateExercise exercise);

    WorkoutTemplateExercise updateTemplateExercise(Long id, WorkoutTemplateExercise updatedExercise);

    void deleteTemplateExercise(Long id);
}
