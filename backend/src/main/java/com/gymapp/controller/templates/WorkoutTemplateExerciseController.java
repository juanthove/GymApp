package com.gymapp.controller.templates;

import com.gymapp.dto.request.templates.WorkoutTemplateExerciseRequest;
import com.gymapp.dto.response.templates.WorkoutTemplateExerciseResponse;
import com.gymapp.service.templates.WorkoutTemplateExerciseService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-template-exercises")
public class WorkoutTemplateExerciseController {

    @Autowired
    private WorkoutTemplateExerciseService workoutTemplateExerciseService;

    @GetMapping
    public List<WorkoutTemplateExerciseResponse> getAllTemplateExercises() {
        return workoutTemplateExerciseService.getAllTemplateExercises();
    }

    @GetMapping("/{id}")
    public WorkoutTemplateExerciseResponse getTemplateExerciseById(@PathVariable Long id) {
        return workoutTemplateExerciseService.getTemplateExerciseById(id);
    }

    @GetMapping("/day/{dayId}")
    public List<WorkoutTemplateExerciseResponse> getExercisesByTemplateDay(@PathVariable Long dayId) {
        return workoutTemplateExerciseService.getExercisesByTemplateDay(dayId);
    }

    @PostMapping
    public WorkoutTemplateExerciseResponse createTemplateExercise(@RequestBody WorkoutTemplateExerciseRequest request) {
        return workoutTemplateExerciseService.createTemplateExercise(request);
    }

    @PutMapping("/{id}")
    public WorkoutTemplateExerciseResponse updateTemplateExercise(
            @PathVariable Long id,
            @RequestBody WorkoutTemplateExerciseRequest request) {
        return workoutTemplateExerciseService.updateTemplateExercise(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteTemplateExercise(@PathVariable Long id) {
        workoutTemplateExerciseService.deleteTemplateExercise(id);
    }
}
