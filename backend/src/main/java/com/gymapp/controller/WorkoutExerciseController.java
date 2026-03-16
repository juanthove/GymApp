package com.gymapp.controller;

import com.gymapp.model.ExerciseType;
import com.gymapp.model.WorkoutExercise;
import com.gymapp.repository.WorkoutExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/workout-exercises")
public class WorkoutExerciseController {

    @Autowired
    private WorkoutExerciseRepository workoutExerciseRepository;

    @GetMapping
    public List<WorkoutExercise> getAllWorkoutExercises() {
        return workoutExerciseRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<WorkoutExercise> getWorkoutExerciseById(@PathVariable Long id) {
        return workoutExerciseRepository.findById(id);
    }

    @GetMapping("/day/{dayId}")
    public List<WorkoutExercise> getExercisesByDay(@PathVariable Long dayId) {
        return workoutExerciseRepository.findByWorkoutDayIdOrderByExerciseOrder(dayId);
    }

    @PostMapping
    public WorkoutExercise createWorkoutExercise(@RequestBody WorkoutExercise workoutExercise) {
        return workoutExerciseRepository.save(workoutExercise);
    }

    @PutMapping("/{id}")
    public WorkoutExercise updateWorkoutExercise(
            @PathVariable Long id,
            @RequestBody WorkoutExercise updatedExercise) {

        return workoutExerciseRepository.findById(id).map(exercise -> {

            exercise.setWorkoutDay(updatedExercise.getWorkoutDay());
            exercise.setExercise(updatedExercise.getExercise());
            exercise.setExerciseOrder(updatedExercise.getExerciseOrder());
            exercise.setReps(updatedExercise.getReps());
            exercise.setWeight(updatedExercise.getWeight());
            exercise.setComment(updatedExercise.getComment());

            return workoutExerciseRepository.save(exercise);

        }).orElseThrow(() -> new RuntimeException("WorkoutExercise not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteWorkoutExercise(@PathVariable Long id) {
        workoutExerciseRepository.deleteById(id);
    }

    //Marcar un ejercicio como completado
    @PatchMapping("/{id}/complete")
    public WorkoutExercise completeWorkoutExercise(@PathVariable Long id){

        WorkoutExercise exercise = workoutExerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));

        exercise.setCompleted(true);

        return workoutExerciseRepository.save(exercise);
    }

    //Marcar un ejercicio como no completado
    @PatchMapping("/{id}/uncomplete")
    public WorkoutExercise uncompleteWorkoutExercise(@PathVariable Long id){

        WorkoutExercise exercise = workoutExerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));

        exercise.setCompleted(false);

        return workoutExerciseRepository.save(exercise);
    }

    // Obtener los ejercicios del día excepto abdominales
    @GetMapping("/day/{dayId}/no-abdominals")
    public List<WorkoutExercise> getExercisesWithoutAbdominals(@PathVariable Long dayId) {

        return workoutExerciseRepository
                .findByWorkoutDayIdAndExercise_TypeNotOrderByExerciseOrder(
                        dayId,
                        ExerciseType.ABDOMINAL
                );
    }

    //Obtener los ejercicios del dia que sean abdominales
    @GetMapping("/day/{dayId}/abdominals")
    public List<WorkoutExercise> getAbdominalExercisesByDay(@PathVariable Long dayId) {

        return workoutExerciseRepository
                .findByWorkoutDayIdAndExercise_TypeOrderByExerciseOrder(
                        dayId,
                        ExerciseType.ABDOMINAL
                );
    }

}
