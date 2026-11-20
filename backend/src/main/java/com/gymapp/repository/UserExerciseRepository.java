package com.gymapp.repository;

import com.gymapp.model.UserExercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserExerciseRepository extends JpaRepository<UserExercise, Long> {

    List<UserExercise> findByUserId(Long userId);

    Optional<UserExercise> findByUserIdAndExerciseId(
            Long userId,
            Long exerciseId);

    boolean existsByUserIdAndExerciseId(
            Long userId,
            Long exerciseId);
}
