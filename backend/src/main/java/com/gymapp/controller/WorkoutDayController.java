package com.gymapp.controller;

import com.gymapp.dto.request.WorkoutDayRequest;
import com.gymapp.dto.response.WorkoutFrequencyResponse;
import com.gymapp.dto.response.WorkoutDayExercisesResponse;
import com.gymapp.dto.response.WorkoutDayResponse;
import com.gymapp.model.Granularity;
import com.gymapp.service.WorkoutDayService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/workout-days")
public class WorkoutDayController {

    @Autowired
    private WorkoutDayService workoutDayService;

    @GetMapping
    public List<WorkoutDayResponse> getAllWorkoutDays() {
        return workoutDayService.getAllWorkoutDays();
    }

    @GetMapping("/{id}")
    public WorkoutDayResponse getWorkoutDayById(@PathVariable Long id) {
        return workoutDayService.getWorkoutDayById(id);
    }

    @GetMapping("/{id}/exercises")
    public WorkoutDayExercisesResponse getWorkoutDayExercises(@PathVariable Long id) {
        return workoutDayService.getWorkoutDayExercises(id);
    }

    @GetMapping("/workout/{workoutId}")
    public List<WorkoutDayResponse> getDaysByWorkout(@PathVariable Long workoutId) {
        return workoutDayService.getDaysByWorkout(workoutId);
    }

    @PostMapping
    public WorkoutDayResponse createWorkoutDay(@Valid @RequestBody WorkoutDayRequest request) {
        return workoutDayService.createWorkoutDay(request);
    }

    @PutMapping("/{id}")
    public WorkoutDayResponse updateWorkoutDay(@PathVariable Long id, @Valid @RequestBody WorkoutDayRequest request) {
        return workoutDayService.updateWorkoutDay(id, request);
    }

    @PostMapping("/{id}/muscle-image")
    public WorkoutDayResponse uploadMuscleImage(
            @PathVariable Long id,
            @RequestParam("muscleImage") MultipartFile muscleImage) throws IOException {
        return workoutDayService.setMuscleImage(id, muscleImage);
    }

    @DeleteMapping("/{id}/muscle-image")
    public WorkoutDayResponse deleteMuscleImage(@PathVariable Long id) throws IOException {
        return workoutDayService.deleteMuscleImage(id);
    }

    @GetMapping("/muscle-image/{filename}")
    public ResponseEntity<Resource> getMuscleImage(@PathVariable String filename) throws IOException {
        return workoutDayService.getMuscleImage(filename);
    }

    @DeleteMapping("/muscle-image/file/{filename}")
    public void deleteImageByFilename(@PathVariable String filename) throws IOException {
        workoutDayService.deleteImageByFilename(filename);
    }

    @DeleteMapping("/{id}")
    public void deleteWorkoutDay(@PathVariable Long id) {
        workoutDayService.deleteWorkoutDay(id);
    }

    @PatchMapping("/{id}/start")
    public WorkoutDayResponse startWorkoutDay(@PathVariable Long id) {
        return workoutDayService.startWorkoutDay(id);
    }

    @PatchMapping("/{id}/complete")
    public WorkoutDayResponse completeWorkoutDay(@PathVariable Long id) {
        return workoutDayService.completeWorkoutDay(id);
    }

    @PatchMapping("/{id}/abdominal")
    public WorkoutDayResponse markAbdominalWorkoutDay(@PathVariable Long id) {
        return workoutDayService.markAbdominalWorkoutDay(id);
    }

    @GetMapping("/{id}/is-abdominal")
    public boolean isAbdominalDay(@PathVariable Long id) {
        return workoutDayService.isAbdominalDay(id);
    }

    @GetMapping("/{id}/status")
    public String getWorkoutDayStatus(@PathVariable Long id) {
        return workoutDayService.getWorkoutDayStatus(id);
    }

    @GetMapping("/user/{userId}/workout-frequency")
    public WorkoutFrequencyResponse getWorkoutFrequency(
            @PathVariable Long userId,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(required = false) Granularity granularity
    ) {
        return workoutDayService.getWorkoutFrequency(userId, from, to, granularity);
    }
}
