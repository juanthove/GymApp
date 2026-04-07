package com.gymapp.controller;

import com.gymapp.dto.request.WorkoutExerciseRequest;
import com.gymapp.dto.response.WorkoutExerciseResponse;
import com.gymapp.service.WorkoutExerciseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    public WorkoutExerciseResponse createWorkoutExercise(@Valid @RequestBody WorkoutExerciseRequest request) {
        return workoutExerciseService.createWorkoutExercise(request);
    }

    @PutMapping("/{id}")
    public WorkoutExerciseResponse updateWorkoutExercise(
            @PathVariable Long id,
            @Valid @RequestBody WorkoutExerciseRequest request) {
        return workoutExerciseService.updateWorkoutExercise(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteWorkoutExercise(@PathVariable Long id) {
        workoutExerciseService.deleteWorkoutExercise(id);
    }

    @PatchMapping("/{id}/complete")
    public WorkoutExerciseResponse completeWorkoutExercise(@PathVariable Long id, 
        @RequestBody(required = false) Map<String, Double> body) {
        Double nextWeight = body != null ? body.get("nextWeight") : null;
        return workoutExerciseService.completeWorkoutExercise(id, nextWeight);
    }

    @PatchMapping("/{id}/uncomplete")
    public WorkoutExerciseResponse uncompleteWorkoutExercise(@PathVariable Long id) {
        return workoutExerciseService.uncompleteWorkoutExercise(id);
    }

    @PostMapping("/day/{dayId}/exercise/{exerciseId}/select")
    public void markWorkoutExerciseSelected(@PathVariable Long dayId, @PathVariable Long exerciseId) {
        workoutExerciseService.markWorkoutExerciseSelected(dayId, exerciseId);
    }

    @PostMapping("/day/{dayId}/exercise/{exerciseId}/unselect")
    public void unmarkWorkoutExerciseSelected(@PathVariable Long dayId, @PathVariable Long exerciseId) {
        workoutExerciseService.unmarkWorkoutExerciseSelected(dayId, exerciseId);
    }

    @GetMapping("/day/{dayId}/exercise/{exerciseId}/selected")
    public boolean isWorkoutExerciseSelected(@PathVariable Long dayId, @PathVariable Long exerciseId) {
        return workoutExerciseService.isWorkoutExerciseSelected(dayId, exerciseId);
    }

    @DeleteMapping("/day/{dayId}/selected-file")
    public void deleteSelectedExercisesFile(@PathVariable Long dayId) {
        workoutExerciseService.deleteSelectedWorkoutDayFile(dayId);
    }
}
