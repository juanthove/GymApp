package com.gymapp.service;

import com.gymapp.dto.request.WorkoutFullRequest;
import com.gymapp.dto.request.WorkoutRequest;
import com.gymapp.dto.response.WorkoutFullResponse;
import com.gymapp.dto.response.WorkoutResponse;

import java.util.List;

public interface WorkoutService {

    List<WorkoutResponse> getAllWorkouts();

    WorkoutResponse getWorkoutById(Long id);

    List<WorkoutResponse> getWorkoutsByUser(Long userId);

    WorkoutResponse createWorkout(WorkoutRequest request);

    WorkoutResponse updateWorkout(Long id, WorkoutRequest request);

    void deleteWorkout(Long id);

    WorkoutFullResponse getFullWorkout(Long id);

    WorkoutResponse createFullWorkout(WorkoutFullRequest request);

    WorkoutResponse updateFullWorkout(Long id, WorkoutFullRequest request);

    void deleteFullWorkout(Long id);
}
