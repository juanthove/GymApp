package com.gymapp.dto.response;

import java.util.List;

public record TrainingSummaryResponse(
        int currentStreak,
        List<WorkoutDayCountResponse> trainedDays) {
}
