package com.gymapp.service;

import com.gymapp.model.ExerciseType;
import com.gymapp.model.WorkoutDay;
import com.gymapp.model.WorkoutExercise;
import com.gymapp.repository.WorkoutDayRepository;
import com.gymapp.repository.WorkoutExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WorkoutExerciseServiceImpl implements WorkoutExerciseService {

    @Autowired
    private WorkoutExerciseRepository workoutExerciseRepository;

    @Autowired
    private WorkoutDayRepository workoutDayRepository;

    @Override
    public List<WorkoutExercise> getAllWorkoutExercises() {
        return workoutExerciseRepository.findAll();
    }

    @Override
    public Optional<WorkoutExercise> getWorkoutExerciseById(Long id) {
        return workoutExerciseRepository.findById(id);
    }

    @Override
    public List<WorkoutExercise> getExercisesByDay(Long dayId) {
        WorkoutDay day = workoutDayRepository.findById(dayId)
                .orElseThrow(() -> new RuntimeException("WorkoutDay not found"));

        if (day.getAbdominal()) {
            return workoutExerciseRepository
                    .findByWorkoutDayIdAndExercise_TypeOrderByExerciseOrder(dayId, ExerciseType.ABDOMINAL);
        }
        return workoutExerciseRepository.findByWorkoutDayIdOrderByExerciseOrder(dayId);
    }

    @Override
    public WorkoutExercise createWorkoutExercise(WorkoutExercise workoutExercise) {
        return workoutExerciseRepository.save(workoutExercise);
    }

    @Override
    public WorkoutExercise updateWorkoutExercise(Long id, WorkoutExercise updatedExercise) {
        return workoutExerciseRepository.findById(id).map(exercise -> {
            exercise.setWorkoutDay(updatedExercise.getWorkoutDay());
            exercise.setExercise(updatedExercise.getExercise());
            exercise.setExerciseOrder(updatedExercise.getExerciseOrder());
            exercise.setWeight(updatedExercise.getWeight());
            exercise.setComment(updatedExercise.getComment());
            return workoutExerciseRepository.save(exercise);
        }).orElseThrow(() -> new RuntimeException("WorkoutExercise not found"));
    }

    @Override
    public void deleteWorkoutExercise(Long id) {
        workoutExerciseRepository.deleteById(id);
    }

    @Override
    public WorkoutExercise completeWorkoutExercise(Long id) {
        WorkoutExercise exercise = workoutExerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
        exercise.setCompleted(true);
        return workoutExerciseRepository.save(exercise);
    }

    @Override
    public WorkoutExercise uncompleteWorkoutExercise(Long id) {
        WorkoutExercise exercise = workoutExerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
        exercise.setCompleted(false);
        return workoutExerciseRepository.save(exercise);
    }
}
