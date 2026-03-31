package com.gymapp.service;

import com.gymapp.model.MuscleType;
import com.gymapp.model.WorkoutDay;
import com.gymapp.model.templates.WorkoutTemplateDay;

import java.util.Set;

public interface MuscleService {

    Set<MuscleType> getMusclesFromWorkoutDay(WorkoutDay day);

    Set<MuscleType> getMusclesFromTemplateDay(WorkoutTemplateDay day);
}