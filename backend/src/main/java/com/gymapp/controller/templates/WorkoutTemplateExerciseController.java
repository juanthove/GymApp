package com.gymapp.controller.templates;

import com.gymapp.model.templates.WorkoutTemplateExercise;
import com.gymapp.service.templates.WorkoutTemplateExerciseService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/workout-template-exercises")
public class WorkoutTemplateExerciseController {

    @Autowired
    private WorkoutTemplateExerciseService workoutTemplateExerciseService;

    @GetMapping
    public List<WorkoutTemplateExercise> getAllTemplateExercises() {
        return workoutTemplateExerciseService.getAllTemplateExercises();
    }

    @GetMapping("/{id}")
    public Optional<WorkoutTemplateExercise> getTemplateExerciseById(@PathVariable Long id) {
        return workoutTemplateExerciseService.getTemplateExerciseById(id);
    }

    @GetMapping("/day/{dayId}")
    public List<WorkoutTemplateExercise> getExercisesByTemplateDay(@PathVariable Long dayId) {
        return workoutTemplateExerciseService.getExercisesByTemplateDay(dayId);
    }

    @PostMapping
    public WorkoutTemplateExercise createTemplateExercise(@RequestBody WorkoutTemplateExercise exercise) {
        return workoutTemplateExerciseService.createTemplateExercise(exercise);
    }

    @PutMapping("/{id}")
    public WorkoutTemplateExercise updateTemplateExercise(
            @PathVariable Long id,
            @RequestBody WorkoutTemplateExercise updatedExercise) {
        return workoutTemplateExerciseService.updateTemplateExercise(id, updatedExercise);
    }

    @DeleteMapping("/{id}")
    public void deleteTemplateExercise(@PathVariable Long id) {
        workoutTemplateExerciseService.deleteTemplateExercise(id);
    }
}
