package com.gymapp.controller.templates;

import com.gymapp.dto.request.templates.WorkoutTemplateDayRequest;
import com.gymapp.dto.response.templates.WorkoutTemplateDayResponse;
import com.gymapp.service.templates.WorkoutTemplateDayService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-template-days")
public class WorkoutTemplateDayController {

    @Autowired
    private WorkoutTemplateDayService workoutTemplateDayService;

    @GetMapping
    public List<WorkoutTemplateDayResponse> getAllTemplateDays() {
        return workoutTemplateDayService.getAllTemplateDays();
    }

    @GetMapping("/{id}")
    public WorkoutTemplateDayResponse getTemplateDayById(@PathVariable Long id) {
        return workoutTemplateDayService.getTemplateDayById(id);
    }

    @GetMapping("/template/{templateId}")
    public List<WorkoutTemplateDayResponse> getDaysByTemplate(@PathVariable Long templateId) {
        return workoutTemplateDayService.getDaysByTemplate(templateId);
    }

    @PostMapping
    public WorkoutTemplateDayResponse createTemplateDay(@RequestBody WorkoutTemplateDayRequest request) {
        return workoutTemplateDayService.createTemplateDay(request);
    }

    @PutMapping("/{id}")
    public WorkoutTemplateDayResponse updateTemplateDay(
            @PathVariable Long id,
            @RequestBody WorkoutTemplateDayRequest request) {
        return workoutTemplateDayService.updateTemplateDay(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteTemplateDay(@PathVariable Long id) {
        workoutTemplateDayService.deleteTemplateDay(id);
    }
}
