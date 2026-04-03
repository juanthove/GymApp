package com.gymapp.repository.projection;

import java.time.LocalDate;

public interface WorkoutDayCountProjection {
    LocalDate getDate();
    Long getCount();
}