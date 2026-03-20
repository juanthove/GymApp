package com.gymapp.repository.templates;

import com.gymapp.model.templates.WorkoutTemplateExercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutTemplateExerciseRepository extends JpaRepository<WorkoutTemplateExercise, Long> {

    List<WorkoutTemplateExercise> findByTemplateDayId(Long templateDayId);

    List<WorkoutTemplateExercise> findByTemplateDayIdOrderByExerciseOrder(Long dayId);

    void deleteByTemplateDayId(Long dayId);
}
