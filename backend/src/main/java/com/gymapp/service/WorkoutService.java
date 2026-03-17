package com.gymapp.service;

import com.gymapp.model.Workout;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface WorkoutService {

    List<Workout> getAllWorkouts();

    Optional<Workout> getWorkoutById(Long id);

    List<Workout> getWorkoutsByUser(Long userId);

    Workout createWorkout(Workout workout);

    Workout updateWorkout(Long id, Workout updatedWorkout);

    void deleteWorkout(Long id);

    Map<String, Object> getFullWorkout(Long id);

    Workout createFullWorkout(Map<String, Object> body);

    Workout updateFullWorkout(Long id, Map<String, Object> body);

    void deleteFullWorkout(Long id);
}
