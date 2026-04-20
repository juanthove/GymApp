package com.gymapp.repository;

import com.gymapp.model.WorkoutSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, Long> {

    List<WorkoutSet> findByUserIdOrderBySetNumber(Long userId);

    List<WorkoutSet> findByWorkoutExerciseIdOrderBySetNumber(Long workoutExerciseId);

    List<WorkoutSet> findByUserIdAndPerformedAtBetweenOrderByPerformedAtAscSetNumberAsc(
            Long userId,
            LocalDateTime from,
            LocalDateTime to
    );

    List<WorkoutSet> findByUserIdOrderByPerformedAtAscSetNumberAsc(Long userId);

    List<WorkoutSet> findByUserIdAndPerformedAtAfterOrderByPerformedAtAscSetNumberAsc(
        Long userId,
        LocalDateTime from
    );

    List<WorkoutSet> findByUserIdAndPerformedAtBeforeOrderByPerformedAtAscSetNumberAsc(
        Long userId,
        LocalDateTime to
    );

    @Query(value = """
        WITH weekly AS (
            SELECT 
                e.muscle,
                DATE_TRUNC('week', ws.performed_at) AS week_start,
                SUM(ws.weight * ws.reps) AS weekly_volume
            FROM workout_set ws
            JOIN workout_exercise we ON ws.workout_exercise_id = we.id
            JOIN exercise e ON we.exercise_id = e.id
            WHERE ws.user_id = :userId
            GROUP BY e.muscle, week_start
        ),
        with_running_max AS (
            SELECT
                muscle,
                week_start,
                weekly_volume,
                MAX(weekly_volume) OVER (
                    PARTITION BY muscle
                    ORDER BY week_start
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) AS historical_max
            FROM weekly
        )
        SELECT 
            muscle,
            week_start,
            weekly_volume,
            historical_max
        FROM with_running_max
        WHERE week_start >= COALESCE(CAST(:from AS timestamp), week_start)
        AND week_start <= COALESCE(CAST(:to AS timestamp), week_start)
        ORDER BY 
            week_start,
            CASE muscle
                WHEN 'CHEST' THEN 0
                WHEN 'BACK' THEN 1
                WHEN 'SHOULDERS' THEN 2
                WHEN 'BICEPS' THEN 3
                WHEN 'TRICEPS' THEN 4
                WHEN 'FOREARMS' THEN 5
                WHEN 'QUADRICEPS' THEN 6
                WHEN 'GLUTES' THEN 7
                WHEN 'HAMSTRINGS' THEN 8
                WHEN 'ADDUCTORS' THEN 9
                WHEN 'ABDUCTORS' THEN 10
                WHEN 'CALVES' THEN 11
                WHEN 'ABDOMINALS' THEN 12
                ELSE 999
            END
    """, nativeQuery = true)
    List<Object[]> findWeeklyVolumeWithHistoricalMax(
        @Param("userId") Long userId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );
}
