package com.gymapp.dto.response;

public record ExerciseReminderRuleResponse(
        Long id,
        Long exerciseId,
        Integer weeks
) {}
