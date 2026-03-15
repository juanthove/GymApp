package com.gymapp.controller.templates;

import com.gymapp.model.templates.WorkoutTemplateExercise;
import com.gymapp.repository.templates.WorkoutTemplateExerciseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/workout-template-exercises")
public class WorkoutTemplateExerciseController {

    @Autowired
    private WorkoutTemplateExerciseRepository repository;

    @GetMapping
    public List<WorkoutTemplateExercise> getAllTemplateExercises() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<WorkoutTemplateExercise> getTemplateExerciseById(@PathVariable Long id) {
        return repository.findById(id);
    }

    @GetMapping("/day/{dayId}")
    public List<WorkoutTemplateExercise> getExercisesByTemplateDay(@PathVariable Long dayId) {
        return repository.findByTemplateDayId(dayId);
    }

    @PostMapping
    public WorkoutTemplateExercise createTemplateExercise(@RequestBody WorkoutTemplateExercise exercise) {
        return repository.save(exercise);
    }

    @PutMapping("/{id}")
    public WorkoutTemplateExercise updateTemplateExercise(
            @PathVariable Long id,
            @RequestBody WorkoutTemplateExercise updatedExercise) {

        return repository.findById(id).map(exercise -> {

            exercise.setTemplateDay(updatedExercise.getTemplateDay());
            exercise.setExercise(updatedExercise.getExercise());
            exercise.setExerciseOrder(updatedExercise.getExerciseOrder());

            return repository.save(exercise);

        }).orElseThrow(() -> new RuntimeException("WorkoutTemplateExercise not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteTemplateExercise(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
