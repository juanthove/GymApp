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

    WorkoutTemplateDayResponse setMuscleImage(Long id, org.springframework.web.multipart.MultipartFile muscleImage) throws java.io.IOException;

    WorkoutTemplateDayResponse deleteMuscleImage(Long id) throws java.io.IOException;

    org.springframework.http.ResponseEntity<org.springframework.core.io.Resource> getMuscleImage(String filename) throws java.io.IOException;

    void deleteTemplateDay(Long id);
}
