package com.gymapp.controller.templates;

import com.gymapp.model.templates.WorkoutTemplateDay;
import com.gymapp.repository.templates.WorkoutTemplateDayRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/workout-template-days")
public class WorkoutTemplateDayController {

    @Autowired
    private WorkoutTemplateDayRepository repository;

    @GetMapping
    public List<WorkoutTemplateDay> getAllTemplateDays() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<WorkoutTemplateDay> getTemplateDayById(@PathVariable Long id) {
        return repository.findById(id);
    }

    @GetMapping("/template/{templateId}")
    public List<WorkoutTemplateDay> getDaysByTemplate(@PathVariable Long templateId) {
        return repository.findByTemplateId(templateId);
    }

    @PostMapping
    public WorkoutTemplateDay createTemplateDay(@RequestBody WorkoutTemplateDay day) {
        return repository.save(day);
    }

    @PutMapping("/{id}")
    public WorkoutTemplateDay updateTemplateDay(
            @PathVariable Long id,
            @RequestBody WorkoutTemplateDay updatedDay) {

        return repository.findById(id).map(day -> {

            day.setName(updatedDay.getName());
            day.setMuscles(updatedDay.getMuscles());
            day.setTemplate(updatedDay.getTemplate());

            return repository.save(day);

        }).orElseThrow(() -> new RuntimeException("WorkoutTemplateDay not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteTemplateDay(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
