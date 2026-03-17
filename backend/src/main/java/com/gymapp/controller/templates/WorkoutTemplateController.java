package com.gymapp.controller.templates;

import com.gymapp.model.templates.WorkoutTemplate;
import com.gymapp.service.templates.WorkoutTemplateService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/workout-template")
public class WorkoutTemplateController {

    @Autowired
    private WorkoutTemplateService workoutTemplateService;

    @GetMapping
    public List<WorkoutTemplate> getAllTemplates() {
        return workoutTemplateService.getAllTemplates();
    }

    @GetMapping("/{id}")
    public Optional<WorkoutTemplate> getTemplateById(@PathVariable Long id) {
        return workoutTemplateService.getTemplateById(id);
    }

    @PostMapping
    public WorkoutTemplate createTemplate(@RequestBody WorkoutTemplate template) {
        return workoutTemplateService.createTemplate(template);
    }

    @PutMapping("/{id}")
    public WorkoutTemplate updateTemplate(
            @PathVariable Long id,
            @RequestBody WorkoutTemplate updatedTemplate) {
        return workoutTemplateService.updateTemplate(id, updatedTemplate);
    }

    @DeleteMapping("/{id}")
    public void deleteTemplate(@PathVariable Long id) {
        workoutTemplateService.deleteTemplate(id);
    }

    @PostMapping("/full")
    public WorkoutTemplate createFullTemplate(@RequestBody Map<String, Object> body) {
        return workoutTemplateService.createFullTemplate(body);
    }

    @GetMapping("/full/{id}")
    public Map<String, Object> getFullTemplate(@PathVariable Long id) {
        return workoutTemplateService.getFullTemplate(id);
    }

    @PutMapping("/full/{id}")
    public WorkoutTemplate updateFullTemplate(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        return workoutTemplateService.updateFullTemplate(id, body);
    }

    @DeleteMapping("/full/{id}")
    public void deleteFullTemplate(@PathVariable Long id) {
        workoutTemplateService.deleteFullTemplate(id);
    }
}
