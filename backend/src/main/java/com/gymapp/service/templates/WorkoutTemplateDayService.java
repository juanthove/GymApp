package com.gymapp.service.templates;

import com.gymapp.dto.response.templates.WorkoutTemplateDayResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface WorkoutTemplateDayService {

    WorkoutTemplateDayResponse setMuscleImage(Long id, MultipartFile file) throws IOException;

    WorkoutTemplateDayResponse deleteMuscleImage(Long id) throws IOException;

    ResponseEntity<Resource> getMuscleImage(String filename) throws IOException;

    void deleteTemplateDay(Long id);

    void deleteImageByFilename(String filename) throws IOException;

}