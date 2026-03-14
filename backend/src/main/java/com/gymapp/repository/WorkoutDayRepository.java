package com.gymapp.repository;

import com.gymapp.model.WorkoutDay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutDayRepository extends JpaRepository<WorkoutDay, Long> {

    List<WorkoutDay> findByWorkoutId(Long workoutId);

}