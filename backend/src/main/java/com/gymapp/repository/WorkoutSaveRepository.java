package com.gymapp.repository;

import com.gymapp.model.WorkoutSave;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutSaveRepository extends JpaRepository<WorkoutSave, Long> {
    List<WorkoutSave> findByWorkoutId(Long workoutId);

    List<WorkoutSave> findByWorkoutUserId(Long userId);
}
