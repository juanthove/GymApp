package com.gymapp.service.templates;

import com.gymapp.dto.request.templates.WorkoutTemplateExerciseRequest;
import com.gymapp.dto.response.templates.WorkoutTemplateExerciseResponse;

import java.util.List;

public interface WorkoutTemplateExerciseService {

    List<WorkoutTemplateExerciseResponse> getAllTemplateExercises();

    WorkoutTemplateExerciseResponse getTemplateExerciseById(Long id);

    List<WorkoutTemplateExerciseResponse> getExercisesByTemplateDay(Long dayId);

    WorkoutTemplateExerciseResponse createTemplateExercise(WorkoutTemplateExerciseRequest request);

    WorkoutTemplateExerciseResponse updateTemplateExercise(Long id, WorkoutTemplateExerciseRequest request);

    void deleteTemplateExercise(Long id);
}
