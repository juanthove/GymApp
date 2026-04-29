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

    //Obtener volumen por musculo en un rango de fechas
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
                AND ws.performed_at >= COALESCE(CAST(:from AS timestamp), ws.performed_at)
                AND ws.performed_at <= COALESCE(CAST(:to AS timestamp), ws.performed_at)
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

    //Obtener volumen por musculos de un workoutDay
    @Query(value = """
        SELECT 
            e.muscle,
            SUM(ws.weight * ws.reps) AS total_volume
        FROM workout_set ws
        JOIN workout_exercise we ON ws.workout_exercise_id = we.id
        JOIN exercise e ON we.exercise_id = e.id
        WHERE we.workout_day_id = :dayId
            AND ws.user_id = :userId
        GROUP BY e.muscle
        ORDER BY 
            CASE e.muscle
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
    List<Object[]> findVolumeByDayId(
        @Param("userId") Long userId,
        @Param("dayId") Long dayId
    );

    //Contar ejercicios completados de un workoutDay
    @Query(value = """
        SELECT 
            SUM(
                CASE 
                    WHEN set_count >= 3 THEN FLOOR(set_count / 3)
                    ELSE 1
                END
            ) AS total_exercises
        FROM (
            SELECT 
                we.id,
                COUNT(ws.id) AS set_count
            FROM workout_set ws
            JOIN workout_exercise we ON ws.workout_exercise_id = we.id
            WHERE we.workout_day_id = :dayId
                AND ws.user_id = :userId
            GROUP BY we.id
        ) t
    """, nativeQuery = true)
    Integer countExercisesByDayCustom(
        @Param("userId") Long userId,
        @Param("dayId") Long dayId
    );

    //Obtener el volumen total de un workoutDay
    @Query(value = """
        SELECT 
            COALESCE(SUM(ws.weight * ws.reps), 0)
        FROM workout_set ws
        JOIN workout_exercise we ON ws.workout_exercise_id = we.id
        WHERE we.workout_day_id = :dayId
            AND ws.user_id = :userId
    """, nativeQuery = true)
    Double getTotalVolumeByDay(
        @Param("userId") Long userId,
        @Param("dayId") Long dayId
    );
}
