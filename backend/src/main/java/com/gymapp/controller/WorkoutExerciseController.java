package com.gymapp.controller;

import com.gymapp.model.WorkoutExercise;
import com.gymapp.service.WorkoutExerciseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/workout-exercises")
public class WorkoutExerciseController {

    @Autowired
    private WorkoutExerciseService workoutExerciseService;

    @GetMapping
    public List<WorkoutExercise> getAllWorkoutExercises() {
        return workoutExerciseService.getAllWorkoutExercises();
    }

    @GetMapping("/{id}")
    public Optional<WorkoutExercise> getWorkoutExerciseById(@PathVariable Long id) {
        return workoutExerciseService.getWorkoutExerciseById(id);
    }

    @GetMapping("/day/{dayId}")
    public List<WorkoutExercise> getExercisesByDay(@PathVariable Long dayId) {
        return workoutExerciseService.getExercisesByDay(dayId);
    }

    @PostMapping
    public WorkoutExercise createWorkoutExercise(@RequestBody WorkoutExercise workoutExercise) {
        return workoutExerciseService.createWorkoutExercise(workoutExercise);
    }

    @PutMapping("/{id}")
    public WorkoutExercise updateWorkoutExercise(
            @PathVariable Long id,
            @RequestBody WorkoutExercise updatedExercise) {
        return workoutExerciseService.updateWorkoutExercise(id, updatedExercise);
    }

    @DeleteMapping("/{id}")
    public void deleteWorkoutExercise(@PathVariable Long id) {
        workoutExerciseService.deleteWorkoutExercise(id);
    }

    @PatchMapping("/{id}/complete")
    public WorkoutExercise completeWorkoutExercise(@PathVariable Long id) {
        return workoutExerciseService.completeWorkoutExercise(id);
    }

    @PatchMapping("/{id}/uncomplete")
    public WorkoutExercise uncompleteWorkoutExercise(@PathVariable Long id) {
        return workoutExerciseService.uncompleteWorkoutExercise(id);
    }
}
