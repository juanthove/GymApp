package com.gymapp.controller;

import com.gymapp.model.WorkoutDay;
import com.gymapp.service.WorkoutDayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/workout-days")
public class WorkoutDayController {

    @Autowired
    private WorkoutDayService workoutDayService;

    @GetMapping
    public List<WorkoutDay> getAllWorkoutDays() {
        return workoutDayService.getAllWorkoutDays();
    }

    @GetMapping("/{id}")
    public Optional<WorkoutDay> getWorkoutDayById(@PathVariable Long id) {
        return workoutDayService.getWorkoutDayById(id);
    }

    @GetMapping("/workout/{workoutId}")
    public List<WorkoutDay> getDaysByWorkout(@PathVariable Long workoutId) {
        return workoutDayService.getDaysByWorkout(workoutId);
    }

    @PostMapping
    public WorkoutDay createWorkoutDay(@RequestBody WorkoutDay workoutDay) {
        return workoutDayService.createWorkoutDay(workoutDay);
    }

    @PutMapping("/{id}")
    public WorkoutDay updateWorkoutDay(@PathVariable Long id, @RequestBody WorkoutDay updatedDay) {
        return workoutDayService.updateWorkoutDay(id, updatedDay);
    }

    @DeleteMapping("/{id}")
    public void deleteWorkoutDay(@PathVariable Long id) {
        workoutDayService.deleteWorkoutDay(id);
    }

    @PatchMapping("/{id}/start")
    public WorkoutDay startWorkoutDay(@PathVariable Long id) {
        return workoutDayService.startWorkoutDay(id);
    }

    @PatchMapping("/{id}/complete")
    public WorkoutDay completeWorkoutDay(@PathVariable Long id) {
        return workoutDayService.completeWorkoutDay(id);
    }

    @PatchMapping("/{id}/abdominal")
    public WorkoutDay markAbdominalWorkoutDay(@PathVariable Long id) {
        return workoutDayService.markAbdominalWorkoutDay(id);
    }

    @GetMapping("/{id}/is-abdominal")
    public boolean isAbdominalDay(@PathVariable Long id) {
        return workoutDayService.isAbdominalDay(id);
    }

    @GetMapping("/{id}/status")
    public String getWorkoutDayStatus(@PathVariable Long id) {
        return workoutDayService.getWorkoutDayStatus(id);
    }
}
