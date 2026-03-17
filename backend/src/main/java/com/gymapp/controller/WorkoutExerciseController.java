package com.gymapp.controller;

import com.gymapp.dto.request.WorkoutExerciseRequest;
import com.gymapp.dto.response.WorkoutExerciseResponse;
import com.gymapp.service.WorkoutExerciseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-exercises")
public class WorkoutExerciseController {

    @Autowired
    private WorkoutExerciseService workoutExerciseService;

    @GetMapping
    public List<WorkoutExerciseResponse> getAllWorkoutExercises() {
        return workoutExerciseService.getAllWorkoutExercises();
    }

    @GetMapping("/{id}")
    public WorkoutExerciseResponse getWorkoutExerciseById(@PathVariable Long id) {
        return workoutExerciseService.getWorkoutExerciseById(id);
    }

    @GetMapping("/day/{dayId}")
    public List<WorkoutExerciseResponse> getExercisesByDay(@PathVariable Long dayId) {
        return workoutExerciseService.getExercisesByDay(dayId);
    }

    @PostMapping
    public WorkoutExerciseResponse createWorkoutExercise(@RequestBody WorkoutExerciseRequest request) {
        return workoutExerciseService.createWorkoutExercise(request);
    }

    @PutMapping("/{id}")
    public WorkoutExerciseResponse updateWorkoutExercise(
            @PathVariable Long id,
            @RequestBody WorkoutExerciseRequest request) {
        return workoutExerciseService.updateWorkoutExercise(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteWorkoutExercise(@PathVariable Long id) {
        workoutExerciseService.deleteWorkoutExercise(id);
    }

    @PatchMapping("/{id}/complete")
    public WorkoutExerciseResponse completeWorkoutExercise(@PathVariable Long id) {
        return workoutExerciseService.completeWorkoutExercise(id);
    }

    @PatchMapping("/{id}/uncomplete")
    public WorkoutExerciseResponse uncompleteWorkoutExercise(@PathVariable Long id) {
        return workoutExerciseService.uncompleteWorkoutExercise(id);
    }
}
