package com.gymapp.controller;

import com.gymapp.model.Workout;
import com.gymapp.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    @Autowired
    private WorkoutRepository workoutRepository;

    // Obtener todos los workouts
    @GetMapping
    public List<Workout> getAllWorkouts() {
        return workoutRepository.findAll();
    }

    // Obtener un workout por id
    @GetMapping("/{id}")
    public Optional<Workout> getWorkoutById(@PathVariable Long id) {
        return workoutRepository.findById(id);
    }

    // Obtener workouts de un usuario
    @GetMapping("/user/{userId}")
    public List<Workout> getWorkoutsByUser(@PathVariable Long userId) {
        return workoutRepository.findByUserId(userId);
    }

    // Crear workout
    @PostMapping
    public Workout createWorkout(@RequestBody Workout workout) {
        return workoutRepository.save(workout);
    }

    // Actualizar workout
    @PutMapping("/{id}")
    public Workout updateWorkout(@PathVariable Long id, @RequestBody Workout updatedWorkout) {

        return workoutRepository.findById(id).map(workout -> {

            workout.setName(updatedWorkout.getName());
            workout.setStartDate(updatedWorkout.getStartDate());
            workout.setEndDate(updatedWorkout.getEndDate());
            workout.setUser(updatedWorkout.getUser());

            return workoutRepository.save(workout);

        }).orElseThrow(() -> new RuntimeException("Workout not found"));
    }

    // Eliminar workout
    @DeleteMapping("/{id}")
    public void deleteWorkout(@PathVariable Long id) {
        workoutRepository.deleteById(id);
    }

}