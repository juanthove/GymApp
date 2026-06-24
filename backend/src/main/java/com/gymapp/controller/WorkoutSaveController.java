package com.gymapp.controller;

import com.gymapp.dto.request.WorkoutSaveRequest;
import com.gymapp.dto.response.WorkoutSaveResponse;
import com.gymapp.service.WorkoutSaveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-saves")
public class WorkoutSaveController {

    @Autowired
    private WorkoutSaveService workoutSaveService;

    @GetMapping
    public List<WorkoutSaveResponse> getAllWorkoutSaves() {
        return workoutSaveService.getAllWorkoutSaves();
    }

    @GetMapping("/{id}")
    public WorkoutSaveResponse getWorkoutSaveById(@PathVariable Long id) {
        return workoutSaveService.getWorkoutSaveById(id);
    }

    @GetMapping("/workout/{workoutId}")
    public List<WorkoutSaveResponse> getWorkoutSavesByWorkout(@PathVariable Long workoutId) {
        return workoutSaveService.getWorkoutSavesByWorkout(workoutId);
    }

    @GetMapping("/user/{userId}")
    public List<WorkoutSaveResponse> getWorkoutSavesByUser(@PathVariable Long userId) {
        return workoutSaveService.getWorkoutSavesByUser(userId);
    }

    @PostMapping
    public WorkoutSaveResponse createWorkoutSave(@Valid @RequestBody WorkoutSaveRequest request) {
        return workoutSaveService.createWorkoutSave(request);
    }

    @PutMapping("/{id}")
    public WorkoutSaveResponse updateWorkoutSave(@PathVariable Long id,
            @Valid @RequestBody WorkoutSaveRequest request) {
        return workoutSaveService.updateWorkoutSave(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteWorkoutSave(@PathVariable Long id) {
        workoutSaveService.deleteWorkoutSave(id);
    }
}
