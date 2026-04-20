package com.gymapp.service;

import com.gymapp.dto.request.ExerciseReminderRuleRequest;
import com.gymapp.dto.response.ExerciseReminderRuleResponse;

import java.util.List;

public interface ExerciseReminderRuleService {

    List<ExerciseReminderRuleResponse> getAllExerciseReminderRules();

    ExerciseReminderRuleResponse getExerciseReminderRuleById(Long id);

    ExerciseReminderRuleResponse getExerciseReminderRuleByExercise(Long exerciseId);

    ExerciseReminderRuleResponse createExerciseReminderRule(ExerciseReminderRuleRequest request);

    ExerciseReminderRuleResponse updateExerciseReminderRule(Long id, ExerciseReminderRuleRequest request);

    void deleteExerciseReminderRule(Long id);
}
