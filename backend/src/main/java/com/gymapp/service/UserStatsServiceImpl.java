package com.gymapp.service;

import com.gymapp.model.User;
import com.gymapp.repository.UserRepository;

import java.time.LocalDate;
import java.time.temporal.WeekFields;

import org.springframework.stereotype.Service;

@Service
public class UserStatsServiceImpl implements UserStatsService {

    private final UserRepository userRepository;

    public UserStatsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Actualizar las stats del usuario para los logros
    @Override
    public void updateUserStats(User user, LocalDate workoutDate) {

        LocalDate lastDate = user.getLastWorkoutDate();

        // Siempre suma total
        user.setTotalWorkoutDays(user.getTotalWorkoutDays() + 1);

        if (lastDate == null) {
            // Primer entrenamiento
            user.setCurrentWeekWorkoutCount(1);
            user.setStreakStartDate(workoutDate);
            user.setLastWorkoutDate(workoutDate);
            return;
        }

        WeekFields weekFields = WeekFields.ISO;

        int currentWeek = workoutDate.get(weekFields.weekOfWeekBasedYear());
        int lastWeek = lastDate.get(weekFields.weekOfWeekBasedYear());

        int currentYear = workoutDate.getYear();
        int lastYear = lastDate.getYear();

        boolean sameWeek = currentWeek == lastWeek && currentYear == lastYear;

        if (sameWeek) {

            // Sigue en la misma semana
            user.setCurrentWeekWorkoutCount(
                    user.getCurrentWeekWorkoutCount() + 1);

        } else {

            // Cambió de semana → validar semana anterior
            if (user.getCurrentWeekWorkoutCount() >= user.getGymDaysPerWeek()) {

                // Streak continúa → No tocar fecha

            } else {

                // Streak roto → reinicia desde hoy
                user.setStreakStartDate(workoutDate);
            }

            // Nueva semana arranca en 1
            user.setCurrentWeekWorkoutCount(1);
        }

        user.setLastWorkoutDate(workoutDate);
    }

    // Actualizar las stats del usuario para cuando entre a ver los logros
    @Override
    public void updateUserStreakState(User user) {

        LocalDate today = LocalDate.now();
        LocalDate lastDate = user.getLastWorkoutDate();

        if (lastDate == null)
            return;

        WeekFields weekFields = WeekFields.ISO;

        int currentWeek = today.get(weekFields.weekOfWeekBasedYear());
        int lastWeek = lastDate.get(weekFields.weekOfWeekBasedYear());

        int currentYear = today.getYear();
        int lastYear = lastDate.getYear();

        boolean sameWeek = currentWeek == lastWeek && currentYear == lastYear;

        if (sameWeek)
            return;

        // Cambió la semana → validar semana anterior
        if (user.getCurrentWeekWorkoutCount() >= user.getGymDaysPerWeek()) {

            // Cumple

        } else {

            // No cumplie → reset streak
            user.setStreakStartDate(null);
        }

        // Reset semana actual (todavía no entrenó esta semana)
        user.setCurrentWeekWorkoutCount(0);

        userRepository.save(user);
    }
}
