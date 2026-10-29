package com.gymapp.repository;

import com.gymapp.model.WorkoutDay;
import com.gymapp.repository.projection.WorkoutDayCountProjection;
import com.gymapp.repository.projection.WorkoutDateProjection;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.*;

public interface WorkoutDayRepository extends JpaRepository<WorkoutDay, Long> {

    List<WorkoutDay> findByWorkoutIdOrderByDayOrder(Long workoutId);

    long countByMuscleImage(String muscleImage);

    long countByMuscleImageAndIdNot(String muscleImage, Long id);

    void deleteByWorkoutId(Long workoutId);

    @Query("""
                SELECT
                    CAST(wd.finishedAt AS date) as date,
                    COUNT(wd) as count
                FROM WorkoutDay wd
                WHERE wd.workout.user.id = :userId
                AND wd.finishedAt IS NOT NULL
                GROUP BY CAST(wd.finishedAt AS date)
                ORDER BY CAST(wd.finishedAt AS date)
            """)
    List<WorkoutDayCountProjection> countWorkoutDaysByDate(Long userId);

    // Devuelve las fechas de los dias completados entre un rango de fechas
    @Query("""
                SELECT CAST(wd.finishedAt AS date) AS date
                FROM WorkoutDay wd
                WHERE wd.workout.user.id = :userId
                AND wd.finishedAt IS NOT NULL
                AND CAST(wd.finishedAt AS date) BETWEEN :startDate AND :endDate
                ORDER BY CAST(wd.finishedAt AS date)
            """)
    List<WorkoutDateProjection> findWorkoutDatesByUserAndDateRange(
            Long userId,
            LocalDate startDate,
            LocalDate endDate);
}