package com.gymapp.repository;

import com.gymapp.model.UserWorkout;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserWorkoutRepository extends JpaRepository<UserWorkout, Long> {

}