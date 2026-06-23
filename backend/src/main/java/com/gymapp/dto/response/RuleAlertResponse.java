package com.gymapp.dto.response;

import java.util.List;

public record RuleAlertResponse(
        Long ruleId,
        String ruleName,
        List<Long> exerciseIds,
        ExerciseAlertResponse alert) {
}
