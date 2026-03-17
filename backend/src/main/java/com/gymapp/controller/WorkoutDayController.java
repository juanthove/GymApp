package com.gymapp.controller;

import com.gymapp.model.WorkoutDay;
import com.gymapp.repository.WorkoutDayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

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
        return workoutDayRepository.findByWorkoutIdOrderByDayOrder(workoutId);
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
    
    //Iniciar un dia de entrenamiento
    @PatchMapping("/{id}/start")
    public WorkoutDay startWorkoutDay(@PathVariable Long id){

        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout day not found"));

        day.setStartedAt(LocalDateTime.now());

        return workoutDayRepository.save(day);
    }

    //Completar un dia de entrenamiento
    @PatchMapping("/{id}/complete")
    public WorkoutDay completeWorkoutDay(@PathVariable Long id){

        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout day not found"));

        day.setFinishedAt(LocalDateTime.now());

        return workoutDayRepository.save(day);
    }


    //Poner un dia como que se hizo abdominales
    @PatchMapping("/{id}/abdominal")
    public WorkoutDay markAbdominalWorkoutDay(@PathVariable Long id){

        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout day not found"));

        day.setAbdominal(true);

        return workoutDayRepository.save(day);
    }

    //Saber si un dia es de adbominales
    @GetMapping("/{id}/is-abdominal")
    public boolean isAbdominalDay(@PathVariable Long id) {

        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkoutDay not found"));

        return day.getAbdominal();
    }

    // Obtener el estado del día de entrenamiento
    @GetMapping("/{id}/status")
    public String getWorkoutDayStatus(@PathVariable Long id) {

        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkoutDay not found"));

        if (day.getStartedAt() == null) {
            return "NOT_STARTED";
        }

        if (day.getFinishedAt() == null) {
            return "IN_PROGRESS";
        }

        return "COMPLETED";
    }

}