package com.gymapp.controller;

import com.gymapp.dto.request.WorkoutSetRequest;
import com.gymapp.dto.response.WorkoutSetResponse;
import com.gymapp.service.WorkoutSetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
