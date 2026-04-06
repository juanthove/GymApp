package com.gymapp.repository;

import com.gymapp.model.ExerciseType;
import com.gymapp.model.WorkoutDay;
import com.gymapp.model.WorkoutExercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, Long> {

    List<WorkoutExercise> findByWorkoutDayIdOrderByExerciseOrder(Long workoutDayId);

    List<WorkoutExercise> findByWorkoutDayId(Long workoutDayId);

    List<WorkoutExercise> findByWorkoutDay(WorkoutDay workoutDay);

    void deleteByWorkoutDayId(Long workoutDayId);

    List<WorkoutExercise> findByWorkoutDayIdAndExercise_TypeOrderByExerciseOrder(Long workoutDayId, ExerciseType type);

    List<WorkoutExercise> findByWorkoutDayIdAndExercise_TypeNotOrderByExerciseOrder(Long dayId, ExerciseType type);

    List<WorkoutExercise> findByWorkoutDayOrderByExerciseOrder(WorkoutDay day);
}