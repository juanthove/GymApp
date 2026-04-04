package com.gymapp.service;

import com.gymapp.dto.request.WorkoutDayRequest;
import com.gymapp.dto.response.WorkoutFrequencyResponse;
import com.gymapp.dto.response.WorkoutDayExercisesResponse;
import com.gymapp.dto.response.WorkoutDayResponse;
import com.gymapp.model.Granularity;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

public interface WorkoutDayService {

    List<WorkoutDayResponse> getAllWorkoutDays();

    WorkoutDayResponse getWorkoutDayById(Long id);

    List<WorkoutDayResponse> getDaysByWorkout(Long workoutId);

    WorkoutDayResponse createWorkoutDay(WorkoutDayRequest request);

    WorkoutDayResponse updateWorkoutDay(Long id, WorkoutDayRequest request);

    WorkoutDayResponse setMuscleImage(Long id, MultipartFile file) throws IOException;

    WorkoutDayResponse deleteMuscleImage(Long id) throws IOException;

    ResponseEntity<Resource> getMuscleImage(String filename) throws IOException;

    void deleteImageByFilename(String filename) throws IOException;

    void deleteWorkoutDay(Long id);

    WorkoutDayResponse startWorkoutDay(Long id);

    WorkoutDayResponse completeWorkoutDay(Long id);

    WorkoutDayResponse markAbdominalWorkoutDay(Long id);

    boolean isAbdominalDay(Long id);

    String getWorkoutDayStatus(Long id);

    WorkoutDayExercisesResponse getWorkoutDayExercises(Long dayId);

    WorkoutFrequencyResponse getWorkoutFrequency(Long userId, LocalDate from, LocalDate to, Granularity granularity);
}
