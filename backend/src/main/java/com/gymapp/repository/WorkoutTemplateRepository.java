package com.gymapp.repository;

import com.gymapp.model.WorkoutTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutTemplateRepository extends JpaRepository<WorkoutTemplate, Long> {

}