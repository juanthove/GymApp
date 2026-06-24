package com.gymapp.service;

import com.gymapp.dto.request.WorkoutSaveRequest;
import com.gymapp.dto.response.WorkoutSaveResponse;

import java.util.List;

public interface WorkoutSaveService {
    List<WorkoutSaveResponse> getAllWorkoutSaves();

    WorkoutSaveResponse getWorkoutSaveById(Long id);

    List<WorkoutSaveResponse> getWorkoutSavesByWorkout(Long workoutId);

    List<WorkoutSaveResponse> getWorkoutSavesByUser(Long userId);

    WorkoutSaveResponse createWorkoutSave(WorkoutSaveRequest request);

    WorkoutSaveResponse updateWorkoutSave(Long id, WorkoutSaveRequest request);

    void deleteWorkoutSave(Long id);
}
