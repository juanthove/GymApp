package com.gymapp.controller;

import com.gymapp.model.Workout;
import com.gymapp.service.WorkoutService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    @Autowired
    private WorkoutService workoutService;

    @GetMapping
    public List<Workout> getAllWorkouts() {
        return workoutService.getAllWorkouts();
    }

    @GetMapping("/{id}")
    public Optional<Workout> getWorkoutById(@PathVariable Long id) {
        return workoutService.getWorkoutById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Workout> getWorkoutsByUser(@PathVariable Long userId) {
        return workoutService.getWorkoutsByUser(userId);
    }

    @PostMapping
    public Workout createWorkout(@RequestBody Workout workout) {
        return workoutService.createWorkout(workout);
    }

    @PutMapping("/{id}")
    public Workout updateWorkout(@PathVariable Long id, @RequestBody Workout updatedWorkout) {
        return workoutService.updateWorkout(id, updatedWorkout);
    }

    @DeleteMapping("/{id}")
    public void deleteWorkout(@PathVariable Long id) {
        workoutService.deleteWorkout(id);
    }

    @GetMapping("/full/{id}")
    public Map<String, Object> getFullWorkout(@PathVariable Long id) {
        return workoutService.getFullWorkout(id);
    }

    @PostMapping("/full")
    public Workout createFullWorkout(@RequestBody Map<String, Object> body) {
        return workoutService.createFullWorkout(body);
    }

    @PutMapping("/full/{id}")
    public Workout updateFullWorkout(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return workoutService.updateFullWorkout(id, body);
    }

    @DeleteMapping("/full/{id}")
    public void deleteFullWorkout(@PathVariable Long id) {
        workoutService.deleteFullWorkout(id);
    }
}
