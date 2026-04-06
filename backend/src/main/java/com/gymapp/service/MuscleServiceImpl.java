package com.gymapp.service;

import com.gymapp.model.*;
import com.gymapp.model.templates.*;
import com.gymapp.repository.WorkoutExerciseRepository;
import com.gymapp.repository.templates.WorkoutTemplateExerciseRepository;

import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MuscleServiceImpl implements MuscleService {

    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final WorkoutTemplateExerciseRepository workoutTemplateExerciseRepository;

    public MuscleServiceImpl(WorkoutExerciseRepository workoutExerciseRepository,
                             WorkoutTemplateExerciseRepository workoutTemplateExerciseRepository) {
        this.workoutExerciseRepository = workoutExerciseRepository;
        this.workoutTemplateExerciseRepository = workoutTemplateExerciseRepository;
    }

    @Override
    public Set<MuscleType> getMusclesFromWorkoutDay(WorkoutDay day) {
        if (day == null) return Set.of();

        return workoutExerciseRepository
                .findByWorkoutDayOrderByExerciseOrder(day) // 🔥 IMPORTANTE
                .stream()
                .map(WorkoutExercise::getExercise)
                .filter(e -> e != null && e.getMuscle() != null)
                .map(Exercise::getMuscle)
                .collect(Collectors.toCollection(LinkedHashSet::new)); // 🔥 MANTIENE ORDEN
    }

    @Override
    public Set<MuscleType> getMusclesFromTemplateDay(WorkoutTemplateDay day) {
        if (day == null) return Set.of();

        return workoutTemplateExerciseRepository.findByTemplateDay(day).stream()
                .map(WorkoutTemplateExercise::getExercise)
                .filter(e -> e != null && e.getMuscle() != null)
                .map(Exercise::getMuscle)
                .collect(Collectors.toSet());
    }
}