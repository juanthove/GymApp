package com.gymapp.service.templates;

import com.gymapp.model.templates.WorkoutTemplateExercise;
import com.gymapp.repository.templates.WorkoutTemplateExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WorkoutTemplateExerciseServiceImpl implements WorkoutTemplateExerciseService {

    @Autowired
    private WorkoutTemplateExerciseRepository workoutTemplateExerciseRepository;

    @Override
    public List<WorkoutTemplateExercise> getAllTemplateExercises() {
        return workoutTemplateExerciseRepository.findAll();
    }

    @Override
    public Optional<WorkoutTemplateExercise> getTemplateExerciseById(Long id) {
        return workoutTemplateExerciseRepository.findById(id);
    }

    @Override
    public List<WorkoutTemplateExercise> getExercisesByTemplateDay(Long dayId) {
        return workoutTemplateExerciseRepository.findByTemplateDayId(dayId);
    }

    @Override
    public WorkoutTemplateExercise createTemplateExercise(WorkoutTemplateExercise exercise) {
        return workoutTemplateExerciseRepository.save(exercise);
    }

    @Override
    public WorkoutTemplateExercise updateTemplateExercise(Long id, WorkoutTemplateExercise updatedExercise) {
        return workoutTemplateExerciseRepository.findById(id).map(exercise -> {
            exercise.setTemplateDay(updatedExercise.getTemplateDay());
            exercise.setExercise(updatedExercise.getExercise());
            exercise.setExerciseOrder(updatedExercise.getExerciseOrder());
            return workoutTemplateExerciseRepository.save(exercise);
        }).orElseThrow(() -> new RuntimeException("WorkoutTemplateExercise not found"));
    }

    @Override
    public void deleteTemplateExercise(Long id) {
        workoutTemplateExerciseRepository.deleteById(id);
    }
}
