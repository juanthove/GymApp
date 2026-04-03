package com.gymapp.dto.response;

import java.util.List;
import com.gymapp.model.Granularity;

public record WorkoutFrequencyResponse(
    Granularity granularity,
    List<WorkoutDayCountResponse> data
) {}