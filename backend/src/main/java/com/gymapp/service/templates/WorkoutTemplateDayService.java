package com.gymapp.service.templates;

import com.gymapp.model.templates.WorkoutTemplateDay;

import java.util.List;
import java.util.Optional;

public interface WorkoutTemplateDayService {

    List<WorkoutTemplateDay> getAllTemplateDays();

    Optional<WorkoutTemplateDay> getTemplateDayById(Long id);

    List<WorkoutTemplateDay> getDaysByTemplate(Long templateId);

    WorkoutTemplateDay createTemplateDay(WorkoutTemplateDay day);

    WorkoutTemplateDay updateTemplateDay(Long id, WorkoutTemplateDay updatedDay);

    void deleteTemplateDay(Long id);
}
