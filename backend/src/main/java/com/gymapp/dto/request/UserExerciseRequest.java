package com.gymapp.dto.request;

public record UserExerciseRequest(
        Long exerciseId,
        Double weight) {
}