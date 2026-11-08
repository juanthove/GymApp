package com.gymapp.repository;

import com.gymapp.model.MuscleType;
import com.gymapp.model.WorkoutSet;
import com.gymapp.repository.projection.ExerciseWeightProjection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
            LocalDateTime to);

    List<WorkoutSet> findByUserIdOrderByPerformedAtAscSetNumberAsc(Long userId);

    List<WorkoutSet> findByUserIdAndPerformedAtAfterOrderByPerformedAtAscSetNumberAsc(
            Long userId,
            LocalDateTime from);

    List<WorkoutSet> findByUserIdAndPerformedAtBeforeOrderByPerformedAtAscSetNumberAsc(
            Long userId,
            LocalDateTime to);

    // Obtener volumen por musculo en un rango de fechas
    @Query(value = """
                WITH weekly AS (
                    SELECT
                        e.muscle,
                        DATE_TRUNC('week', ws.performed_at) AS week_start,
                        SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)) AS weekly_volume
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
            @Param("to") LocalDateTime to);

    // Obtener volumen por musculos de un workoutDay
    @Query(value = """
                SELECT
                    e.muscle,
                    SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)) AS total_volume
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
            @Param("dayId") Long dayId);

    // Contar ejercicios completados de un workoutDay
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
                    COUNT(DISTINCT ws.set_number) AS set_count
                FROM workout_set ws
                JOIN workout_exercise we
                    ON ws.workout_exercise_id = we.id
                WHERE we.workout_day_id = :dayId
                  AND ws.user_id = :userId
                GROUP BY we.id
            ) t
            """, nativeQuery = true)
    Integer countExercisesByDayCustom(
            @Param("userId") Long userId,
            @Param("dayId") Long dayId);

    // Obtener el volumen total de un workoutDay
    @Query(value = """
                SELECT
                    COALESCE(SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)), 0)
                FROM workout_set ws
                JOIN workout_exercise we ON ws.workout_exercise_id = we.id
                WHERE we.workout_day_id = :dayId
                    AND ws.user_id = :userId
            """, nativeQuery = true)
    Double getTotalVolumeByDay(
            @Param("userId") Long userId,
            @Param("dayId") Long dayId);

    @Query("""
                SELECT ws
                FROM WorkoutSet ws
                JOIN FETCH ws.workoutExercise we
                JOIN FETCH we.exercise e
                WHERE we.workoutDay.id = :dayId
            """)
    List<WorkoutSet> findByWorkoutDayId(Long dayId);

    // Obtener el volumen total de todos los set excepto el del dia de hoy
    @Query("""
                SELECT COALESCE(SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)), 0)
                FROM WorkoutSet ws
                JOIN ws.workoutExercise we
                JOIN we.workoutDay wd
                WHERE ws.user.id = :userId
                AND wd.id <> :workoutDayId
            """)
    Double sumTotalVolume(Long userId, Long workoutDayId);

    // Obtener todos los sets de un musculo excepto el del dia de hoy
    @Query("""
                SELECT COALESCE(SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)), 0)
                FROM WorkoutSet ws
                JOIN ws.workoutExercise we
                JOIN we.workoutDay wd
                WHERE ws.user.id = :userId
                AND we.exercise.muscle = :muscle
                AND wd.id <> :workoutDayId
            """)
    Double sumVolumeByMuscle(Long userId, MuscleType muscle, Long workoutDayId);

    // Obtener todos los sets de los ejercicios excepto el del dia de hoy
    @Query("""
                SELECT COALESCE(SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)), 0)
                FROM WorkoutSet ws
                JOIN ws.workoutExercise we
                JOIN we.workoutDay wd
                WHERE ws.user.id = :userId
                AND we.exercise.id IN :exerciseIds
                AND wd.id <> :workoutDayId
            """)
    Double sumVolumeByExercises(Long userId, List<Long> exerciseIds, Long workoutDayId);

    // Obtiene todos los sets de un usuario
    @Query("""
                SELECT COALESCE(SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)), 0)
                FROM WorkoutSet ws
                WHERE ws.user.id = :userId
            """)
    Double sumTotalVolumeAll(Long userId);

    // Obtiene todos los sets de un usuario agrupado por musculo
    @Query("""
                SELECT we.exercise.muscle, COALESCE(SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)), 0)
                FROM WorkoutSet ws
                JOIN ws.workoutExercise we
                WHERE ws.user.id = :userId
                GROUP BY we.exercise.muscle
            """)
    List<Object[]> sumVolumeGroupedByMuscle(Long userId);

    // Obtiene todos los sets de un usuario agrupado por ejercicio
    @Query("""
                SELECT we.exercise.id, COALESCE(SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)), 0)
                FROM WorkoutSet ws
                JOIN ws.workoutExercise we
                WHERE ws.user.id = :userId
                GROUP BY we.exercise.id
            """)
    List<Object[]> sumVolumeGroupedByExercise(Long userId);

    // Obtener el volumen total agrupado por usuario
    @Query("""
                SELECT ws.user.id, COALESCE(SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)), 0)
                FROM WorkoutSet ws
                GROUP BY ws.user.id
            """)
    List<Object[]> sumTotalVolumeByUser();

    // Obtener el volumen total de un musculo agrupado por usuario
    @Query("""
                SELECT ws.user.id, COALESCE(SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)), 0)
                FROM WorkoutSet ws
                JOIN ws.workoutExercise we
                WHERE we.exercise.muscle = :muscle
                GROUP BY ws.user.id
            """)
    List<Object[]> sumVolumeByMuscleGroupedByUser(MuscleType muscle);

    // Obtener el volumen total de la lista de ejercicios agrupado por usuario
    @Query("""
                SELECT ws.user.id, COALESCE(SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)),0)
                FROM WorkoutSet ws
                JOIN ws.workoutExercise we
                WHERE we.exercise.id IN :exerciseIds
                GROUP BY ws.user.id
            """)
    List<Object[]> sumVolumeByExercisesGroupedByUser(List<Long> exerciseIds);

    // ============================================================
    // Consultas para obtener volumen para los logros
    // ============================================================

    // Obtener el volumen total de un usuario en un rango de fechas
    @Query(value = """
            SELECT COALESCE(
                SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)),
                0
            )
            FROM workout_set ws
            WHERE ws.user_id = :userId
              AND ws.performed_at >= COALESCE(
                  CAST(:from AS timestamp),
                  CAST('-infinity' AS timestamp)
              )
              AND ws.performed_at < COALESCE(
                  CAST(:to AS timestamp),
                  CAST('infinity' AS timestamp)
              )
            """, nativeQuery = true)
    Double sumTotalVolumeByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    // Obtener el volumen de un musculo de un usuario en un rango de fechas
    @Query(value = """
            SELECT COALESCE(
                SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)),
                0
            )
            FROM workout_set ws
            JOIN workout_exercise we
                ON ws.workout_exercise_id = we.id
            JOIN exercise e
                ON we.exercise_id = e.id
            WHERE ws.user_id = :userId
              AND e.muscle = :muscle
              AND ws.performed_at >= COALESCE(
                  CAST(:from AS timestamp),
                  CAST('-infinity' AS timestamp)
              )
              AND ws.performed_at < COALESCE(
                  CAST(:to AS timestamp),
                  CAST('infinity' AS timestamp)
              )
            """, nativeQuery = true)
    Double sumVolumeByMuscleAndDateRange(
            @Param("userId") Long userId,
            @Param("muscle") String muscle,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    // Obtener el volumen de un conjunto de ejercicios de un usuario en un rango de
    // fechas
    @Query(value = """
            SELECT COALESCE(
                SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)),
                0
            )
            FROM workout_set ws
            JOIN workout_exercise we
                ON ws.workout_exercise_id = we.id
            WHERE ws.user_id = :userId
              AND we.exercise_id IN (:exerciseIds)
              AND ws.performed_at >= COALESCE(
                  CAST(:from AS timestamp),
                  CAST('-infinity' AS timestamp)
              )
              AND ws.performed_at < COALESCE(
                  CAST(:to AS timestamp),
                  CAST('infinity' AS timestamp)
              )
            """, nativeQuery = true)
    Double sumVolumeByExercisesAndDateRange(
            @Param("userId") Long userId,
            @Param("exerciseIds") List<Long> exerciseIds,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    // Obtener el volumen total de todos los usuarios en un rango de fechas
    @Query(value = """
            SELECT
                ws.user_id,
                COALESCE(
                    SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)),
                    0
                ) AS total_volume
            FROM workout_set ws
            WHERE ws.performed_at >= COALESCE(
                CAST(:from AS timestamp),
                CAST('-infinity' AS timestamp)
            )
              AND ws.performed_at < COALESCE(
                CAST(:to AS timestamp),
                CAST('infinity' AS timestamp)
            )
            GROUP BY ws.user_id
            """, nativeQuery = true)
    List<Object[]> sumTotalVolumeByUserAndDateRangeGrouped(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    // Obtener el volumen de un musculo de todos los usuarios en un rango de fechas
    @Query(value = """
            SELECT
                ws.user_id,
                COALESCE(
                    SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)),
                    0
                ) AS total_volume
            FROM workout_set ws
            JOIN workout_exercise we
                ON ws.workout_exercise_id = we.id
            JOIN exercise e
                ON we.exercise_id = e.id
            WHERE e.muscle = :muscle
              AND ws.performed_at >= COALESCE(
                  CAST(:from AS timestamp),
                  CAST('-infinity' AS timestamp)
              )
              AND ws.performed_at < COALESCE(
                  CAST(:to AS timestamp),
                  CAST('infinity' AS timestamp)
              )
            GROUP BY ws.user_id
            """, nativeQuery = true)
    List<Object[]> sumVolumeByMuscleAndDateRangeGrouped(
            @Param("muscle") String muscle,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    // Obtener el volumen de un conjunto de ejercicios de todos los usuarios en un
    // rango de fechas
    @Query(value = """
            SELECT
                ws.user_id,
                COALESCE(
                    SUM(ws.weight * ws.reps * COALESCE(ws.multiplier, 1)),
                    0
                ) AS total_volume
            FROM workout_set ws
            JOIN workout_exercise we
                ON ws.workout_exercise_id = we.id
            WHERE we.exercise_id IN (:exerciseIds)
              AND ws.performed_at >= COALESCE(
                  CAST(:from AS timestamp),
                  CAST('-infinity' AS timestamp)
              )
              AND ws.performed_at < COALESCE(
                  CAST(:to AS timestamp),
                  CAST('infinity' AS timestamp)
              )
            GROUP BY ws.user_id
            """, nativeQuery = true)
    List<Object[]> sumVolumeByExercisesAndDateRangeGrouped(
            @Param("exerciseIds") List<Long> exerciseIds,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    // Eliminar todos los sets de ejercicios incompletos de un dia en progreso
    @Modifying
    @Query(value = """
            DELETE FROM workout_set
            WHERE user_id = :userId
              AND workout_exercise_id IN (
                  SELECT we.id
                  FROM workout_exercise we
                  JOIN workout_day wd ON we.workout_day_id = wd.id
                  WHERE wd.workout_id = :workoutId
                    AND wd.started_at IS NOT NULL
                    AND wd.finished_at IS NULL
                    AND we.completed = false
              )
            """, nativeQuery = true)
    void deleteSetsFromInProgressIncompleteExercises(
            @Param("userId") Long userId,
            @Param("workoutId") Long workoutId);

    // ELiminar todos los sets de un ejercicio
    void deleteByWorkoutExerciseId(Long workoutExerciseId);

    // Obtener los pesos de los ejercicios de un usuario utilizando el current
    // workout y si no los workout sets
    @Query(value = """
            WITH current_weights AS (
                SELECT
                    we.exercise_id,
                    MAX(we.weight) AS weight
                FROM users u
                JOIN workout_day wd
                    ON wd.workout_id = u.current_workout_id
                JOIN workout_exercise we
                    ON we.workout_day_id = wd.id
                WHERE u.id = :userId
                  AND we.exercise_id IN (:exerciseIds)
                GROUP BY we.exercise_id
            ),

            historical_by_date AS (
                SELECT
                    we.exercise_id,
                    CAST(ws.performed_at AS date) AS performed_date,
                    MAX(ws.weight) AS weight
                FROM workout_set ws
                JOIN workout_exercise we
                    ON we.id = ws.workout_exercise_id
                WHERE ws.user_id = :userId
                  AND we.exercise_id IN (:exerciseIds)
                  AND ws.performed_at IS NOT NULL
                  AND NOT EXISTS (
                      SELECT 1
                      FROM current_weights cw
                      WHERE cw.exercise_id = we.exercise_id
                  )
                GROUP BY
                    we.exercise_id,
                    CAST(ws.performed_at AS date)
            ),

            ranked_history AS (
                SELECT
                    exercise_id,
                    weight,
                    ROW_NUMBER() OVER (
                        PARTITION BY exercise_id
                        ORDER BY performed_date DESC
                    ) AS rn
                FROM historical_by_date
            )

            SELECT
                e.id AS "exerciseId",
                CASE
                    WHEN cw.exercise_id IS NOT NULL THEN cw.weight
                    ELSE rh.weight
                END AS weight
            FROM exercise e
            LEFT JOIN current_weights cw
                ON cw.exercise_id = e.id
            LEFT JOIN ranked_history rh
                ON rh.exercise_id = e.id
               AND rh.rn = 1
            WHERE e.id IN (:exerciseIds)
            """, nativeQuery = true)
    List<ExerciseWeightProjection> findWeightsToSync(
            @Param("userId") Long userId,
            @Param("exerciseIds") List<Long> exerciseIds);
}
