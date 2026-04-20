package com.gymapp.repository;

import com.gymapp.model.ExerciseReminderRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExerciseReminderRuleRepository extends JpaRepository<ExerciseReminderRule, Long> {

    Optional<ExerciseReminderRule> findByExerciseId(Long exerciseId);

    boolean existsByExerciseId(Long exerciseId);
}
