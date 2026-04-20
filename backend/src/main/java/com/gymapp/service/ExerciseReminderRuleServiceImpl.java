package com.gymapp.service;

import com.gymapp.dto.request.ExerciseReminderRuleRequest;
import com.gymapp.dto.response.ExerciseReminderRuleResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.Exercise;
import com.gymapp.model.ExerciseReminderRule;
import com.gymapp.repository.ExerciseReminderRuleRepository;
import com.gymapp.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExerciseReminderRuleServiceImpl implements ExerciseReminderRuleService {

    @Autowired
    private ExerciseReminderRuleRepository exerciseReminderRuleRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Override
    public List<ExerciseReminderRuleResponse> getAllExerciseReminderRules() {
        return exerciseReminderRuleRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public ExerciseReminderRuleResponse getExerciseReminderRuleById(Long id) {
        return toResponse(exerciseReminderRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ExerciseReminderRule no encontrado")));
    }

    @Override
    public ExerciseReminderRuleResponse getExerciseReminderRuleByExercise(Long exerciseId) {
        return toResponse(exerciseReminderRuleRepository.findByExerciseId(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("ExerciseReminderRule no encontrado para el ejercicio")));
    }

    @Override
    public ExerciseReminderRuleResponse createExerciseReminderRule(ExerciseReminderRuleRequest request) {
        if (exerciseReminderRuleRepository.existsByExerciseId(request.exerciseId())) {
            throw new IllegalArgumentException("Ya existe una regla de recordatorio para este ejercicio");
        }

        ExerciseReminderRule rule = new ExerciseReminderRule();
        rule.setExercise(findExercise(request.exerciseId()));
        rule.setWeeks(request.weeks());

        return toResponse(exerciseReminderRuleRepository.save(rule));
    }

    @Override
    public ExerciseReminderRuleResponse updateExerciseReminderRule(Long id, ExerciseReminderRuleRequest request) {
        ExerciseReminderRule rule = exerciseReminderRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ExerciseReminderRule no encontrado"));

        Exercise exercise = findExercise(request.exerciseId());
        if (!exercise.getId().equals(rule.getExercise().getId())
                && exerciseReminderRuleRepository.existsByExerciseId(request.exerciseId())) {
            throw new IllegalArgumentException("Ya existe una regla de recordatorio para este ejercicio");
        }

        rule.setExercise(exercise);
        rule.setWeeks(request.weeks());

        return toResponse(exerciseReminderRuleRepository.save(rule));
    }

    @Override
    public void deleteExerciseReminderRule(Long id) {
        if (!exerciseReminderRuleRepository.existsById(id)) {
            throw new ResourceNotFoundException("ExerciseReminderRule no encontrado");
        }
        exerciseReminderRuleRepository.deleteById(id);
    }

    private Exercise findExercise(Long exerciseId) {
        return exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Ejercicio no encontrado"));
    }

    private ExerciseReminderRuleResponse toResponse(ExerciseReminderRule rule) {
        return new ExerciseReminderRuleResponse(
                rule.getId(),
                rule.getExercise() != null ? rule.getExercise().getId() : null,
                rule.getWeeks()
        );
    }
}
