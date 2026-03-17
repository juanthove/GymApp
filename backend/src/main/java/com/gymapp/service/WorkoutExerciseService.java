package com.gymapp.service;

import com.gymapp.dto.request.WorkoutExerciseRequest;
import com.gymapp.dto.response.WorkoutExerciseResponse;

import java.util.List;

public interface WorkoutExerciseService {

    List<WorkoutExerciseResponse> getAllWorkoutExercises();

    WorkoutExerciseResponse getWorkoutExerciseById(Long id);

    List<WorkoutExerciseResponse> getExercisesByDay(Long dayId);

    WorkoutExerciseResponse createWorkoutExercise(WorkoutExerciseRequest request);

    WorkoutExerciseResponse updateWorkoutExercise(Long id, WorkoutExerciseRequest request);

    void deleteWorkoutExercise(Long id);

    WorkoutExerciseResponse completeWorkoutExercise(Long id);

    WorkoutExerciseResponse uncompleteWorkoutExercise(Long id);
}
