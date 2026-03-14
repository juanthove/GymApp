package com.gymapp.repository;

import com.gymapp.model.WorkoutTemplateExercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutTemplateExerciseRepository extends JpaRepository<WorkoutTemplateExercise, Long> {

    List<WorkoutTemplateExercise> findByWorkoutTemplateId(Long workoutTemplateId);
}