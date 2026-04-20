package com.gymapp.repository;

import com.gymapp.model.ExerciseType;
import com.gymapp.model.WorkoutDay;
import com.gymapp.model.WorkoutExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, Long> {

    List<WorkoutExercise> findByWorkoutDayIdOrderByExerciseOrder(Long workoutDayId);

    List<WorkoutExercise> findByWorkoutDayId(Long workoutDayId);

    List<WorkoutExercise> findByWorkoutDay(WorkoutDay workoutDay);

    void deleteByWorkoutDayId(Long workoutDayId);

    List<WorkoutExercise> findByWorkoutDayIdAndExercise_TypeOrderByExerciseOrder(Long workoutDayId, ExerciseType type);

    List<WorkoutExercise> findByWorkoutDayIdAndExercise_TypeNotOrderByExerciseOrder(Long dayId, ExerciseType type);

    List<WorkoutExercise> findByWorkoutDayOrderByExerciseOrder(WorkoutDay day);

    int countByWorkoutDayIdAndCompletedTrue(Long workoutDayId);

    @Query("""
        SELECT 
            e.exercise.id,
            MAX(e.workoutDay.startedAt)
        FROM WorkoutExercise e
        WHERE e.workoutDay.workout.user.id = :userId
            AND e.completed = true
        GROUP BY e.exercise.id
    """)
    List<Object[]> findLastPerformedDatesByUser(@Param("userId") Long userId);
}