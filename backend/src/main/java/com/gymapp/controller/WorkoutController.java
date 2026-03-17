package com.gymapp.controller;

import com.gymapp.dto.request.WorkoutFullRequest;
import com.gymapp.dto.request.WorkoutRequest;
import com.gymapp.dto.response.WorkoutFullResponse;
import com.gymapp.dto.response.WorkoutResponse;
import com.gymapp.service.WorkoutService;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    @Autowired
    private WorkoutService workoutService;

    @GetMapping
    public List<WorkoutResponse> getAllWorkouts() {
        return workoutService.getAllWorkouts();
    }

    @GetMapping("/{id}")
    public WorkoutResponse getWorkoutById(@PathVariable Long id) {
        return workoutService.getWorkoutById(id);
    }

    @GetMapping("/user/{userId}")
    public List<WorkoutResponse> getWorkoutsByUser(@PathVariable Long userId) {
        return workoutService.getWorkoutsByUser(userId);
    }

    @PostMapping
    public WorkoutResponse createWorkout(@Valid @RequestBody WorkoutRequest request) {
        return workoutService.createWorkout(request);
    }

    @PutMapping("/{id}")
    public WorkoutResponse updateWorkout(@PathVariable Long id, @Valid @RequestBody WorkoutRequest request) {
        return workoutService.updateWorkout(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteWorkout(@PathVariable Long id) {
        workoutService.deleteWorkout(id);
    }

    @GetMapping("/full/{id}")
    public WorkoutFullResponse getFullWorkout(@PathVariable Long id) {
        return workoutService.getFullWorkout(id);
    }

    @PostMapping("/full")
    public WorkoutResponse createFullWorkout(@Valid @RequestBody WorkoutFullRequest request) {
        return workoutService.createFullWorkout(request);
    }

    @PutMapping("/full/{id}")
    public WorkoutResponse updateFullWorkout(@PathVariable Long id, @Valid @RequestBody WorkoutFullRequest request) {
        return workoutService.updateFullWorkout(id, request);
    }

    @DeleteMapping("/full/{id}")
    public void deleteFullWorkout(@PathVariable Long id) {
        workoutService.deleteFullWorkout(id);
    }
}
