package com.gymapp.dto.response;

import java.util.List;
import com.gymapp.model.Granularity;

public record WorkoutVolumeResponse(
    Granularity granularity,
    List<WorkoutSetVolumePointResponse> data
) {}
