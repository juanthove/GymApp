package com.gymapp.service.templates;

import com.gymapp.dto.request.templates.WorkoutTemplateExerciseRequest;
import com.gymapp.dto.response.templates.WorkoutTemplateExerciseResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.Exercise;
import com.gymapp.model.templates.WorkoutTemplateDay;
import com.gymapp.model.templates.WorkoutTemplateExercise;
import com.gymapp.repository.ExerciseRepository;
import com.gymapp.repository.templates.WorkoutTemplateDayRepository;
import com.gymapp.repository.templates.WorkoutTemplateExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkoutTemplateExerciseServiceImpl implements WorkoutTemplateExerciseService {

    @Autowired
    private WorkoutTemplateExerciseRepository workoutTemplateExerciseRepository;

    @Autowired
    private WorkoutTemplateDayRepository workoutTemplateDayRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Override
    public List<WorkoutTemplateExerciseResponse> getAllTemplateExercises() {
        return workoutTemplateExerciseRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutTemplateExerciseResponse getTemplateExerciseById(Long id) {
        return toResponse(workoutTemplateExerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutTemplateExercise not found")));
    }

    @Override
    public List<WorkoutTemplateExerciseResponse> getExercisesByTemplateDay(Long dayId) {
        return workoutTemplateExerciseRepository.findByTemplateDayId(dayId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutTemplateExerciseResponse createTemplateExercise(WorkoutTemplateExerciseRequest request) {
        WorkoutTemplateDay day = workoutTemplateDayRepository.findById(request.templateDayId())
                .orElseThrow(() -> new ResourceNotFoundException("Template day not found"));
        Exercise exercise = exerciseRepository.findById(request.exerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));
        WorkoutTemplateExercise templateExercise = new WorkoutTemplateExercise();
        templateExercise.setTemplateDay(day);
        templateExercise.setExercise(exercise);
        templateExercise.setExerciseOrder(request.exerciseOrder());
        return toResponse(workoutTemplateExerciseRepository.save(templateExercise));
    }

    @Override
    public WorkoutTemplateExerciseResponse updateTemplateExercise(Long id, WorkoutTemplateExerciseRequest request) {
        WorkoutTemplateExercise templateExercise = workoutTemplateExerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutTemplateExercise not found"));
        WorkoutTemplateDay day = workoutTemplateDayRepository.findById(request.templateDayId())
                .orElseThrow(() -> new ResourceNotFoundException("Template day not found"));
        Exercise exercise = exerciseRepository.findById(request.exerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));
        templateExercise.setTemplateDay(day);
        templateExercise.setExercise(exercise);
        templateExercise.setExerciseOrder(request.exerciseOrder());
        return toResponse(workoutTemplateExerciseRepository.save(templateExercise));
    }

    @Override
    public void deleteTemplateExercise(Long id) {
        workoutTemplateExerciseRepository.deleteById(id);
    }

    private WorkoutTemplateExerciseResponse toResponse(WorkoutTemplateExercise exercise) {
        Long dayId = exercise.getTemplateDay() != null ? exercise.getTemplateDay().getId() : null;
        Long exerciseId = exercise.getExercise() != null ? exercise.getExercise().getId() : null;
        String exerciseName = exercise.getExercise() != null ? exercise.getExercise().getName() : null;
        return new WorkoutTemplateExerciseResponse(exercise.getId(), dayId, exerciseId,
                exerciseName, exercise.getExerciseOrder());
    }
}
