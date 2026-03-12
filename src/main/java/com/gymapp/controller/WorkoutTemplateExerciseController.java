package com.gymapp.controller;

import com.gymapp.model.WorkoutTemplateExercise;
import com.gymapp.repository.WorkoutTemplateExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workout-template-exercises")
public class WorkoutTemplateExerciseController {

    @Autowired
    private WorkoutTemplateExerciseRepository workoutTemplateExerciseRepository;

    @GetMapping
    public List<WorkoutTemplateExercise> getAllWorkoutTemplateExercises() {
        return workoutTemplateExerciseRepository.findAll();
    }

}