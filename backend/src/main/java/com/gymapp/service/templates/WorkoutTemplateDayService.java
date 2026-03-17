package com.gymapp.service.templates;

import com.gymapp.dto.request.templates.WorkoutTemplateDayRequest;
import com.gymapp.dto.response.templates.WorkoutTemplateDayResponse;

import java.util.List;

public interface WorkoutTemplateDayService {

    List<WorkoutTemplateDayResponse> getAllTemplateDays();

    WorkoutTemplateDayResponse getTemplateDayById(Long id);

    List<WorkoutTemplateDayResponse> getDaysByTemplate(Long templateId);

    WorkoutTemplateDayResponse createTemplateDay(WorkoutTemplateDayRequest request);

    WorkoutTemplateDayResponse updateTemplateDay(Long id, WorkoutTemplateDayRequest request);

    void deleteTemplateDay(Long id);
}
