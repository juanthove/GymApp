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
import java.util.stream.Collectors;

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
        return toResponse(
                exerciseReminderRuleRepository.findByExercises_Id(exerciseId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "ExerciseReminderRule no encontrado para el ejercicio")));
    }

    @Override
    public ExerciseReminderRuleResponse createExerciseReminderRule(ExerciseReminderRuleRequest request) {
        for (Long exerciseId : request.exerciseIds()) {

            Exercise exercise = findExercise(exerciseId);

            var existingRule = exerciseReminderRuleRepository.findByExercises_Id(exerciseId);

            if (existingRule.isPresent()) {
                throw new IllegalArgumentException(
                        "El ejercicio '" + exercise.getName()
                                + "' ya pertenece a la regla '"
                                + existingRule.get().getName() + "'");
            }
        }

        ExerciseReminderRule rule = new ExerciseReminderRule();
        rule.setName(request.name());
        rule.setExercises(
                request.exerciseIds().stream()
                        .map(this::findExercise)
                        .collect(Collectors.toSet()));
        rule.setWeeks(request.weeks());

        return toResponse(exerciseReminderRuleRepository.save(rule));
    }

    @Override
    public ExerciseReminderRuleResponse updateExerciseReminderRule(Long id, ExerciseReminderRuleRequest request) {
        ExerciseReminderRule rule = exerciseReminderRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ExerciseReminderRule no encontrado"));

        for (Long exerciseId : request.exerciseIds()) {

            Exercise exercise = findExercise(exerciseId);

            var existingRule = exerciseReminderRuleRepository.findByExerciseIdAndNotRuleId(
                    exerciseId,
                    id);

            if (existingRule.isPresent()) {
                throw new IllegalArgumentException(
                        "El ejercicio '" + exercise.getName()
                                + "' ya pertenece a la regla '"
                                + existingRule.get().getName() + "'");
            }
        }

        rule.setName(request.name());
        rule.setExercises(
                request.exerciseIds().stream()
                        .map(this::findExercise)
                        .collect(Collectors.toSet()));
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
                rule.getName(),
                rule.getExercises()
                        .stream()
                        .map(Exercise::getId)
                        .toList(),
                rule.getWeeks());
    }
}
