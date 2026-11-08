package com.gymapp.service;

import com.gymapp.model.User;
import java.time.LocalDate;

public interface UserStatsService {

    void updateUserStats(User user, LocalDate workoutDate);

    void updateUserStreakState(User user);
}
