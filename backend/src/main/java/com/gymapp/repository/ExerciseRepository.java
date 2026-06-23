package com.gymapp.repository;

import com.gymapp.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    @Query("""
            SELECT e
            FROM Exercise e
            ORDER BY
            CASE e.type
                WHEN com.gymapp.model.ExerciseType.PRIMARY THEN 0
                WHEN com.gymapp.model.ExerciseType.SECONDARY THEN 1
                WHEN com.gymapp.model.ExerciseType.TERTIARY THEN 2
                WHEN com.gymapp.model.ExerciseType.ABDOMINAL THEN 3
            END,
            e.name
            """)
    List<Exercise> findAllOrdered();
}