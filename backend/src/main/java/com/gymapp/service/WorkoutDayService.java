package com.gymapp.service;

import com.gymapp.model.WorkoutDay;

import java.util.List;
import java.util.Optional;

public interface WorkoutDayService {

    List<WorkoutDay> getAllWorkoutDays();

    Optional<WorkoutDay> getWorkoutDayById(Long id);

    List<WorkoutDay> getDaysByWorkout(Long workoutId);

    WorkoutDay createWorkoutDay(WorkoutDay workoutDay);

    WorkoutDay updateWorkoutDay(Long id, WorkoutDay updatedDay);

    void deleteWorkoutDay(Long id);

    WorkoutDay startWorkoutDay(Long id);

    WorkoutDay completeWorkoutDay(Long id);

    WorkoutDay markAbdominalWorkoutDay(Long id);

    boolean isAbdominalDay(Long id);

    String getWorkoutDayStatus(Long id);
}
