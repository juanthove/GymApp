package com.gymapp.dto.response;

import java.util.List;

public record ExerciseReminderRuleResponse(
        Long id,
        String name,
        List<Long> exerciseIds,
        Integer weeks) {
}
