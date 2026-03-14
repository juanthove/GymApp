package com.gymapp.controller;

import com.gymapp.model.WorkoutTemplate;
import com.gymapp.repository.WorkoutTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-templates")
public class WorkoutTemplateController {

    @Autowired
    private WorkoutTemplateRepository workoutTemplateRepository;

    @GetMapping
    public List<WorkoutTemplate> getAllWorkoutTemplates() {
        return workoutTemplateRepository.findAll();
    }

    @GetMapping("/{id}")
    public WorkoutTemplate getWorkoutTemplateById(@PathVariable Long id) {
        return workoutTemplateRepository.findById(id).orElseThrow();
    }

    @PostMapping
    public WorkoutTemplate createWorkoutTemplate(@RequestBody WorkoutTemplate workoutTemplate) {
        return workoutTemplateRepository.save(workoutTemplate);
    }
}