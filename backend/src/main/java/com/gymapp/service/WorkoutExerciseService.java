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

    void markWorkoutExerciseSelected(Long dayId, Long workoutExerciseId);

    void unmarkWorkoutExerciseSelected(Long dayId, Long workoutExerciseId);

    boolean isWorkoutExerciseSelected(Long dayId, Long workoutExerciseId);

    void deleteSelectedWorkoutDayFile(Long dayId);
}
