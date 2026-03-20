package com.gymapp.controller.templates;

import com.gymapp.dto.response.templates.WorkoutTemplateDayResponse;
import com.gymapp.service.templates.WorkoutTemplateDayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/workout-template-days")
public class WorkoutTemplateDayController {

    @Autowired
    private WorkoutTemplateDayService workoutTemplateDayService;



    @PostMapping("/{id}/muscle-image")
    public WorkoutTemplateDayResponse uploadMuscleImage(
            @PathVariable Long id,
            @RequestParam("muscleImage") MultipartFile muscleImage) throws IOException {
        return workoutTemplateDayService.setMuscleImage(id, muscleImage);
    }

    @DeleteMapping("/{id}/muscle-image")
    public WorkoutTemplateDayResponse deleteMuscleImage(@PathVariable Long id) throws IOException {
        return workoutTemplateDayService.deleteMuscleImage(id);
    }

    @GetMapping("/muscle-image/{filename}")
    public ResponseEntity<Resource> getMuscleImage(@PathVariable String filename) throws IOException {
        return workoutTemplateDayService.getMuscleImage(filename);
    }

    @DeleteMapping("/{id}")
    public void deleteTemplateDay(@PathVariable Long id) {
        workoutTemplateDayService.deleteTemplateDay(id);
    }

    @DeleteMapping("/muscle-image/file/{filename}")
    public void deleteImageByFilename(@PathVariable String filename) throws IOException {
        workoutTemplateDayService.deleteImageByFilename(filename);
    }
}
