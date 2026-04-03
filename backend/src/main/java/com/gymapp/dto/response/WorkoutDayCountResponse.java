package com.gymapp.dto.response;

import java.time.LocalDate;

public record WorkoutDayCountResponse(
        LocalDate date,
        Long count
) {}