package com.gymapp.controller;

import com.gymapp.model.WorkoutTemplate;
import com.gymapp.repository.WorkoutTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

}