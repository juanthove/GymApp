package com.gymapp.controller.templates;

import com.gymapp.dto.request.templates.WorkoutTemplateFullRequest;
import com.gymapp.dto.request.templates.WorkoutTemplateRequest;
import com.gymapp.dto.response.templates.WorkoutTemplateFullResponse;
import com.gymapp.dto.response.templates.WorkoutTemplateResponse;
import com.gymapp.service.templates.WorkoutTemplateService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-template")
public class WorkoutTemplateController {

    @Autowired
    private WorkoutTemplateService workoutTemplateService;

    @GetMapping
    public List<WorkoutTemplateResponse> getAllTemplates() {
        return workoutTemplateService.getAllTemplates();
    }

    @GetMapping("/{id}")
    public WorkoutTemplateResponse getTemplateById(@PathVariable Long id) {
        return workoutTemplateService.getTemplateById(id);
    }

    @PostMapping
    public WorkoutTemplateResponse createTemplate(@RequestBody WorkoutTemplateRequest request) {
        return workoutTemplateService.createTemplate(request);
    }

    @PutMapping("/{id}")
    public WorkoutTemplateResponse updateTemplate(
            @PathVariable Long id,
            @RequestBody WorkoutTemplateRequest request) {
        return workoutTemplateService.updateTemplate(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteTemplate(@PathVariable Long id) {
        workoutTemplateService.deleteTemplate(id);
    }

    @PostMapping("/full")
    public WorkoutTemplateResponse createFullTemplate(@RequestBody WorkoutTemplateFullRequest request) {
        return workoutTemplateService.createFullTemplate(request);
    }

    @GetMapping("/full/{id}")
    public WorkoutTemplateFullResponse getFullTemplate(@PathVariable Long id) {
        return workoutTemplateService.getFullTemplate(id);
    }

    @PutMapping("/full/{id}")
    public WorkoutTemplateResponse updateFullTemplate(
            @PathVariable Long id,
            @RequestBody WorkoutTemplateFullRequest request) {
        return workoutTemplateService.updateFullTemplate(id, request);
    }

    @DeleteMapping("/full/{id}")
    public void deleteFullTemplate(@PathVariable Long id) {
        workoutTemplateService.deleteFullTemplate(id);
    }
}
