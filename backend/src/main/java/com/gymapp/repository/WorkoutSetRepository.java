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
        SELECT 
            e.muscle,
            MAX(weekly_volume) AS max_volume
        FROM (
            SELECT 
                e.muscle,
                DATE_TRUNC('week', ws.performed_at) AS week,
                SUM(ws.weight * ws.reps) AS weekly_volume
            FROM workout_set ws
            JOIN exercise e ON ws.exercise_id = e.id
            WHERE ws.user_id = :userId
                AND ws.performed_at < :from
            GROUP BY e.muscle, week
        ) sub
        GROUP BY muscle
    """, nativeQuery = true)
    List<Object[]> findMaxWeeklyVolumeBeforeDateByMuscle(
        @Param("userId") Long userId,
        @Param("from") LocalDateTime from
    );
}
