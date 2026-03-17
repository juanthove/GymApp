package com.gymapp.service.templates;

import com.gymapp.dto.request.templates.WorkoutTemplateFullRequest;
import com.gymapp.dto.request.templates.WorkoutTemplateRequest;
import com.gymapp.dto.response.templates.WorkoutTemplateFullResponse;
import com.gymapp.dto.response.templates.WorkoutTemplateResponse;

import java.util.List;

public interface WorkoutTemplateService {

    List<WorkoutTemplateResponse> getAllTemplates();

    WorkoutTemplateResponse getTemplateById(Long id);

    WorkoutTemplateResponse createTemplate(WorkoutTemplateRequest request);

    WorkoutTemplateResponse updateTemplate(Long id, WorkoutTemplateRequest request);

    void deleteTemplate(Long id);

    WorkoutTemplateResponse createFullTemplate(WorkoutTemplateFullRequest request);

    WorkoutTemplateFullResponse getFullTemplate(Long id);

    WorkoutTemplateResponse updateFullTemplate(Long id, WorkoutTemplateFullRequest request);

    void deleteFullTemplate(Long id);
}
