package com.gymapp.service;

import com.gymapp.dto.request.WorkoutSetRequest;
import com.gymapp.dto.response.WorkoutSetResponse;
import com.gymapp.dto.response.WorkoutSetVolumeResponse;
import com.gymapp.dto.response.WorkoutSetWeeklyMuscleVolumeResponse;
import com.gymapp.dto.response.WorkoutSetVolumePointResponse;
import com.gymapp.model.Granularity;

import java.time.LocalDate;
import java.util.List;

public interface WorkoutSetService {

    List<WorkoutSetResponse> getAllWorkoutSets();

    WorkoutSetResponse getWorkoutSetById(Long id);

    List<WorkoutSetResponse> getWorkoutSetsByUser(Long userId);

    List<WorkoutSetResponse> getWorkoutSetsByUserAndDateRange(Long userId, LocalDate from, LocalDate to);

    WorkoutSetVolumeResponse getTotalVolumeByUserAndDateRange(Long userId, LocalDate from, LocalDate to);

    List<WorkoutSetWeeklyMuscleVolumeResponse> getWeeklyMuscleVolumeByUserAndDateRange(Long userId, LocalDate from, LocalDate to);

    List<WorkoutSetVolumePointResponse> getVolumeSeriesByUserAndDateRange(Long userId, LocalDate from, LocalDate to, Granularity granularity);

    List<WorkoutSetResponse> getWorkoutSetsByWorkoutExercise(Long workoutExerciseId);

    WorkoutSetResponse createWorkoutSet(WorkoutSetRequest request);

    WorkoutSetResponse updateWorkoutSet(Long id, WorkoutSetRequest request);

    void deleteWorkoutSet(Long id);
}
