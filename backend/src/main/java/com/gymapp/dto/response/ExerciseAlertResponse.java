package com.gymapp.dto.response;

public record ExerciseAlertResponse(
    boolean overdue,
    Integer weeksSinceLastPerformed,
    String lastPerformedDate
) {}
