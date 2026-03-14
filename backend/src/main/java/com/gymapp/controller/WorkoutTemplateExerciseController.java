package com.gymapp.controller;

import com.gymapp.model.Exercise;
import com.gymapp.model.ExerciseType;
import com.gymapp.model.WorkoutTemplate;
import com.gymapp.model.WorkoutTemplateExercise;
import com.gymapp.repository.ExerciseRepository;
import com.gymapp.repository.WorkoutTemplateExerciseRepository;
import com.gymapp.repository.WorkoutTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-template-exercises")
public class WorkoutTemplateExerciseController {

    @Autowired
    private WorkoutTemplateExerciseRepository workoutTemplateExerciseRepository;

    @Autowired
    private WorkoutTemplateRepository workoutTemplateRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @GetMapping("/template/{templateId}")
    public List<WorkoutTemplateExercise> getExercisesByTemplate(@PathVariable Long templateId) {
        return workoutTemplateExerciseRepository.findByWorkoutTemplateId(templateId);
    }

    @PostMapping
    public WorkoutTemplateExercise createWorkoutTemplateExercise(@RequestBody WorkoutTemplateExerciseRequest request) {
        WorkoutTemplate workoutTemplate = workoutTemplateRepository.findById(request.getWorkoutTemplateId()).orElseThrow();
        Exercise exercise = exerciseRepository.findById(request.getExerciseId()).orElseThrow();

        WorkoutTemplateExercise wte = new WorkoutTemplateExercise();
        wte.setWorkoutTemplate(workoutTemplate);
        wte.setExercise(exercise);
        wte.setType(request.getType());

        return workoutTemplateExerciseRepository.save(wte);
    }

    public static class WorkoutTemplateExerciseRequest {
        private Long workoutTemplateId;
        private Long exerciseId;
        private ExerciseType type;

        // getters and setters
        public Long getWorkoutTemplateId() { return workoutTemplateId; }
        public void setWorkoutTemplateId(Long workoutTemplateId) { this.workoutTemplateId = workoutTemplateId; }
        public Long getExerciseId() { return exerciseId; }
        public void setExerciseId(Long exerciseId) { this.exerciseId = exerciseId; }
        public ExerciseType getType() { return type; }
        public void setType(ExerciseType type) { this.type = type; }
    }
}