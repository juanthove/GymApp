package com.gymapp.repository;

import com.gymapp.model.ExerciseReminderRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ExerciseReminderRuleRepository extends JpaRepository<ExerciseReminderRule, Long> {

    Optional<ExerciseReminderRule> findByExercises_Id(Long exerciseId);

    boolean existsByExercises_Id(Long exerciseId);

    @Query("""
                select r
                from ExerciseReminderRule r
                join r.exercises e
                where e.id = :exerciseId
                  and r.id <> :ruleId
            """)
    Optional<ExerciseReminderRule> findByExerciseIdAndNotRuleId(
            Long exerciseId,
            Long ruleId);
}
