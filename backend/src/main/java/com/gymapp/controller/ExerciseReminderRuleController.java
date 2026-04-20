package com.gymapp.controller;

import com.gymapp.dto.request.ExerciseReminderRuleRequest;
import com.gymapp.dto.response.ExerciseReminderRuleResponse;
import com.gymapp.service.ExerciseReminderRuleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercise-reminder-rules")
public class ExerciseReminderRuleController {

    @Autowired
    private ExerciseReminderRuleService exerciseReminderRuleService;

    @GetMapping
    public List<ExerciseReminderRuleResponse> getAllExerciseReminderRules() {
        return exerciseReminderRuleService.getAllExerciseReminderRules();
    }

    @GetMapping("/{id}")
    public ExerciseReminderRuleResponse getExerciseReminderRuleById(@PathVariable Long id) {
        return exerciseReminderRuleService.getExerciseReminderRuleById(id);
    }

    @GetMapping("/exercise/{exerciseId}")
    public ExerciseReminderRuleResponse getExerciseReminderRuleByExercise(@PathVariable Long exerciseId) {
        return exerciseReminderRuleService.getExerciseReminderRuleByExercise(exerciseId);
    }

    @PostMapping
    public ExerciseReminderRuleResponse createExerciseReminderRule(
            @RequestBody @Valid ExerciseReminderRuleRequest request) {
        return exerciseReminderRuleService.createExerciseReminderRule(request);
    }

    @PutMapping("/{id}")
    public ExerciseReminderRuleResponse updateExerciseReminderRule(
            @PathVariable Long id,
            @RequestBody @Valid ExerciseReminderRuleRequest request) {
        return exerciseReminderRuleService.updateExerciseReminderRule(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteExerciseReminderRule(@PathVariable Long id) {
        exerciseReminderRuleService.deleteExerciseReminderRule(id);
    }
}
