package com.gymapp.service;

import com.gymapp.dto.request.WorkoutDayRequest;
import com.gymapp.dto.response.WorkoutDayResponse;

import java.util.List;

public interface WorkoutDayService {

    List<WorkoutDayResponse> getAllWorkoutDays();

    WorkoutDayResponse getWorkoutDayById(Long id);

    List<WorkoutDayResponse> getDaysByWorkout(Long workoutId);

    WorkoutDayResponse createWorkoutDay(WorkoutDayRequest request);

    WorkoutDayResponse updateWorkoutDay(Long id, WorkoutDayRequest request);

    void deleteWorkoutDay(Long id);

    WorkoutDayResponse startWorkoutDay(Long id);

    WorkoutDayResponse completeWorkoutDay(Long id);

    WorkoutDayResponse markAbdominalWorkoutDay(Long id);

    boolean isAbdominalDay(Long id);

    String getWorkoutDayStatus(Long id);
}
