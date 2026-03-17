package com.gymapp.service;

import com.gymapp.model.WorkoutExercise;

import java.util.List;
import java.util.Optional;

public interface WorkoutExerciseService {

    List<WorkoutExercise> getAllWorkoutExercises();

    Optional<WorkoutExercise> getWorkoutExerciseById(Long id);

    List<WorkoutExercise> getExercisesByDay(Long dayId);

    WorkoutExercise createWorkoutExercise(WorkoutExercise workoutExercise);

    WorkoutExercise updateWorkoutExercise(Long id, WorkoutExercise updatedExercise);

    void deleteWorkoutExercise(Long id);

    WorkoutExercise completeWorkoutExercise(Long id);

    WorkoutExercise uncompleteWorkoutExercise(Long id);
}
