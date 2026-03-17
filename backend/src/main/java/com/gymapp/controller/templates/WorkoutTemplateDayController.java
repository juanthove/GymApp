package com.gymapp.controller.templates;

import com.gymapp.model.templates.WorkoutTemplateDay;
import com.gymapp.service.templates.WorkoutTemplateDayService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/workout-template-days")
public class WorkoutTemplateDayController {

    @Autowired
    private WorkoutTemplateDayService workoutTemplateDayService;

    @GetMapping
    public List<WorkoutTemplateDay> getAllTemplateDays() {
        return workoutTemplateDayService.getAllTemplateDays();
    }

    @GetMapping("/{id}")
    public Optional<WorkoutTemplateDay> getTemplateDayById(@PathVariable Long id) {
        return workoutTemplateDayService.getTemplateDayById(id);
    }

    @GetMapping("/template/{templateId}")
    public List<WorkoutTemplateDay> getDaysByTemplate(@PathVariable Long templateId) {
        return workoutTemplateDayService.getDaysByTemplate(templateId);
    }

    @PostMapping
    public WorkoutTemplateDay createTemplateDay(@RequestBody WorkoutTemplateDay day) {
        return workoutTemplateDayService.createTemplateDay(day);
    }

    @PutMapping("/{id}")
    public WorkoutTemplateDay updateTemplateDay(
            @PathVariable Long id,
            @RequestBody WorkoutTemplateDay updatedDay) {
        return workoutTemplateDayService.updateTemplateDay(id, updatedDay);
    }

    @DeleteMapping("/{id}")
    public void deleteTemplateDay(@PathVariable Long id) {
        workoutTemplateDayService.deleteTemplateDay(id);
    }
}
