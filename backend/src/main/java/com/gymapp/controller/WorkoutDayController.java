package com.gymapp.controller;

import com.gymapp.dto.request.WorkoutDayRequest;
import com.gymapp.dto.response.WorkoutDayResponse;
import com.gymapp.service.WorkoutDayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-days")
public class WorkoutDayController {

    @Autowired
    private WorkoutDayService workoutDayService;

    @GetMapping
    public List<WorkoutDayResponse> getAllWorkoutDays() {
        return workoutDayService.getAllWorkoutDays();
    }

    @GetMapping("/{id}")
    public WorkoutDayResponse getWorkoutDayById(@PathVariable Long id) {
        return workoutDayService.getWorkoutDayById(id);
    }

    @GetMapping("/workout/{workoutId}")
    public List<WorkoutDayResponse> getDaysByWorkout(@PathVariable Long workoutId) {
        return workoutDayService.getDaysByWorkout(workoutId);
    }

    @PostMapping
    public WorkoutDayResponse createWorkoutDay(@RequestBody WorkoutDayRequest request) {
        return workoutDayService.createWorkoutDay(request);
    }

    @PutMapping("/{id}")
    public WorkoutDayResponse updateWorkoutDay(@PathVariable Long id, @RequestBody WorkoutDayRequest request) {
        return workoutDayService.updateWorkoutDay(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteWorkoutDay(@PathVariable Long id) {
        workoutDayService.deleteWorkoutDay(id);
    }

    @PatchMapping("/{id}/start")
    public WorkoutDayResponse startWorkoutDay(@PathVariable Long id) {
        return workoutDayService.startWorkoutDay(id);
    }

    @PatchMapping("/{id}/complete")
    public WorkoutDayResponse completeWorkoutDay(@PathVariable Long id) {
        return workoutDayService.completeWorkoutDay(id);
    }

    @PatchMapping("/{id}/abdominal")
    public WorkoutDayResponse markAbdominalWorkoutDay(@PathVariable Long id) {
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
