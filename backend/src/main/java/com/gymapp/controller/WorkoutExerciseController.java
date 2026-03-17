package com.gymapp.controller;

import com.gymapp.model.ExerciseType;
import com.gymapp.model.WorkoutDay;
import com.gymapp.model.WorkoutExercise;
import com.gymapp.repository.WorkoutExerciseRepository;
import com.gymapp.repository.WorkoutDayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/workout-exercises")
public class WorkoutExerciseController {

    @Autowired
    private WorkoutExerciseRepository workoutExerciseRepository;

    @Autowired
    private WorkoutDayRepository workoutDayRepository;

    @GetMapping
    public List<WorkoutExercise> getAllWorkoutExercises() {
        return workoutExerciseRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<WorkoutExercise> getWorkoutExerciseById(@PathVariable Long id) {
        return workoutExerciseRepository.findById(id);
    }

    //Obtener todos los ejercicios si el dia es no abdominal o solo abdominales si el dia es abdominal
    @GetMapping("/day/{dayId}")
    public List<WorkoutExercise> getExercisesByDay(@PathVariable Long dayId) {

        WorkoutDay day = workoutDayRepository.findById(dayId)
                .orElseThrow(() -> new RuntimeException("WorkoutDay not found"));

        // Si el día es abdominal → solo abdominales
        if (day.getAbdominal()) {
            return workoutExerciseRepository
                    .findByWorkoutDayIdAndExercise_TypeOrderByExerciseOrder(
                            dayId,
                            ExerciseType.ABDOMINAL
                    );
        }

        // Si no es abdominal → todos los ejercicios
        return workoutExerciseRepository
                .findByWorkoutDayIdOrderByExerciseOrder(dayId);
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

}
