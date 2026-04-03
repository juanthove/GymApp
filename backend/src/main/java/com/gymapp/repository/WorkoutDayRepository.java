package com.gymapp.repository;

import com.gymapp.model.WorkoutDay;
import com.gymapp.repository.projection.WorkoutDayCountProjection;

import java.util.List;

import org.springframework.data.jpa.repository.*;



public interface WorkoutDayRepository extends JpaRepository<WorkoutDay, Long> {

    List<WorkoutDay> findByWorkoutIdOrderByDayOrder(Long workoutId);

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


}