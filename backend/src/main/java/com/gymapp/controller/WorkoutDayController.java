package com.gymapp.controller;

import com.gymapp.model.WorkoutDay;
import com.gymapp.repository.WorkoutDayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/workout-days")
public class WorkoutDayController {

    @Autowired
    private WorkoutDayRepository workoutDayRepository;

    @GetMapping
    public List<WorkoutDay> getAllWorkoutDays() {
        return workoutDayRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<WorkoutDay> getWorkoutDayById(@PathVariable Long id) {
        return workoutDayRepository.findById(id);
    }

    @GetMapping("/workout/{workoutId}")
    public List<WorkoutDay> getDaysByWorkout(@PathVariable Long workoutId) {
        return workoutDayRepository.findByWorkoutId(workoutId);
    }

    @PostMapping
    public WorkoutDay createWorkoutDay(@RequestBody WorkoutDay workoutDay) {
        return workoutDayRepository.save(workoutDay);
    }

    @PutMapping("/{id}")
    public WorkoutDay updateWorkoutDay(@PathVariable Long id, @RequestBody WorkoutDay updatedDay) {

        return workoutDayRepository.findById(id).map(day -> {

            day.setName(updatedDay.getName());
            day.setMuscles(updatedDay.getMuscles());
            day.setWorkout(updatedDay.getWorkout());

            return workoutDayRepository.save(day);

        }).orElseThrow(() -> new RuntimeException("WorkoutDay not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteWorkoutDay(@PathVariable Long id) {
        workoutDayRepository.deleteById(id);
    }


    //Completar un dia de entrenamiento
    @PatchMapping("/{id}/complete")
    public WorkoutDay completeWorkoutDay(@PathVariable Long id){

        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout day not found"));

        day.setCompleted(true);

        return workoutDayRepository.save(day);
    }


    //Marcar un dia de entrenamiento como no completado
    @PatchMapping("/{id}/uncomplete")
    public WorkoutDay uncompleteWorkoutDay(@PathVariable Long id){

        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout day not found"));

        day.setCompleted(false);

        return workoutDayRepository.save(day);
    }

}