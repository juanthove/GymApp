package com.gymapp.service.templates;

import com.gymapp.model.templates.WorkoutTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface WorkoutTemplateService {

    List<WorkoutTemplate> getAllTemplates();

    Optional<WorkoutTemplate> getTemplateById(Long id);

    WorkoutTemplate createTemplate(WorkoutTemplate template);

    WorkoutTemplate updateTemplate(Long id, WorkoutTemplate updatedTemplate);

    void deleteTemplate(Long id);

    WorkoutTemplate createFullTemplate(Map<String, Object> body);

    Map<String, Object> getFullTemplate(Long id);

    WorkoutTemplate updateFullTemplate(Long id, Map<String, Object> body);

    void deleteFullTemplate(Long id);
}
