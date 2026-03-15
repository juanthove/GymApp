package com.gymapp.repository.templates;

import com.gymapp.model.templates.WorkoutTemplateDay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutTemplateDayRepository extends JpaRepository<WorkoutTemplateDay, Long> {

    List<WorkoutTemplateDay> findByTemplateId(Long templateId);

    void deleteByTemplateId(Long templateId);
}
