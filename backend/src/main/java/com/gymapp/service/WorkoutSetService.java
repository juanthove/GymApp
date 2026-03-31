package com.gymapp.service;

import com.gymapp.dto.request.WorkoutSetRequest;
import com.gymapp.dto.response.WorkoutSetResponse;

import java.util.List;

public interface WorkoutSetService {

    List<WorkoutSetResponse> getAllWorkoutSets();

    WorkoutSetResponse getWorkoutSetById(Long id);

    List<WorkoutSetResponse> getWorkoutSetsByUser(Long userId);

    List<WorkoutSetResponse> getWorkoutSetsByWorkoutExercise(Long workoutExerciseId);

    WorkoutSetResponse createWorkoutSet(WorkoutSetRequest request);

    WorkoutSetResponse updateWorkoutSet(Long id, WorkoutSetRequest request);

    void deleteWorkoutSet(Long id);
}
