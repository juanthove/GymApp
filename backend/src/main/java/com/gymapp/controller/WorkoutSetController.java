package com.gymapp.controller;

import com.gymapp.dto.request.WorkoutSetRequest;
import com.gymapp.dto.response.WorkoutSetResponse;
import com.gymapp.dto.response.WorkoutSetVolumePointResponse;
import com.gymapp.dto.response.WorkoutSetVolumeResponse;
import com.gymapp.dto.response.WorkoutSetWeeklyMuscleVolumeResponse;
import com.gymapp.model.Granularity;
import com.gymapp.service.WorkoutSetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/workout-sets")
public class WorkoutSetController {

    @Autowired
    private WorkoutSetService workoutSetService;

    @GetMapping
    public List<WorkoutSetResponse> getAllWorkoutSets() {
        return workoutSetService.getAllWorkoutSets();
    }

    @GetMapping("/{id}")
    public WorkoutSetResponse getWorkoutSetById(@PathVariable Long id) {
        return workoutSetService.getWorkoutSetById(id);
    }

    @GetMapping("/user/{userId}")
    public List<WorkoutSetResponse> getWorkoutSetsByUser(@PathVariable Long userId) {
        return workoutSetService.getWorkoutSetsByUser(userId);
    }

    @GetMapping("/user/{userId}/range")
    public List<WorkoutSetResponse> getWorkoutSetsByUserAndDateRange(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return workoutSetService.getWorkoutSetsByUserAndDateRange(userId, from, to);
    }

    @GetMapping("/user/{userId}/volume")
    public WorkoutSetVolumeResponse getTotalVolumeByUserAndDateRange(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return workoutSetService.getTotalVolumeByUserAndDateRange(userId, from, to);
    }

    @GetMapping("/user/{userId}/volume/weekly-by-muscle")
    public List<WorkoutSetWeeklyMuscleVolumeResponse> getWeeklyMuscleVolumeByUserAndDateRange(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return workoutSetService.getWeeklyMuscleVolumeByUserAndDateRange(userId, from, to);
    }

    @GetMapping("/user/{userId}/volume-series")
    public List<WorkoutSetVolumePointResponse> getVolumeSeries(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Granularity granularity
    ) {
        return workoutSetService.getVolumeSeriesByUserAndDateRange(userId, from, to, granularity);
    }

    @GetMapping("/workout-exercise/{workoutExerciseId}")
    public List<WorkoutSetResponse> getWorkoutSetsByWorkoutExercise(@PathVariable Long workoutExerciseId) {
        return workoutSetService.getWorkoutSetsByWorkoutExercise(workoutExerciseId);
    }

    @PostMapping
    public WorkoutSetResponse createWorkoutSet(@Valid @RequestBody WorkoutSetRequest request) {
        return workoutSetService.createWorkoutSet(request);
    }

    @PutMapping("/{id}")
    public WorkoutSetResponse updateWorkoutSet(@PathVariable Long id, @Valid @RequestBody WorkoutSetRequest request) {
        return workoutSetService.updateWorkoutSet(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteWorkoutSet(@PathVariable Long id) {
        workoutSetService.deleteWorkoutSet(id);
    }
}
