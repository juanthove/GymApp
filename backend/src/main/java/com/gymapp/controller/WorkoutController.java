package com.gymapp.controller;

import com.gymapp.model.User;
import com.gymapp.model.Workout;
import com.gymapp.model.Exercise;
import com.gymapp.model.WorkoutDay;
import com.gymapp.model.WorkoutExercise;
import com.gymapp.repository.WorkoutRepository;
import com.gymapp.repository.WorkoutDayRepository;
import com.gymapp.repository.WorkoutExerciseRepository;
import com.gymapp.repository.ExerciseRepository;
import com.gymapp.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private WorkoutDayRepository workoutDayRepository;

    @Autowired
    private WorkoutExerciseRepository workoutExerciseRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private UserRepository userRepository;

    // Obtener todos los workouts
    @GetMapping
    public List<Workout> getAllWorkouts() {
        return workoutRepository.findAll();
    }

    // Obtener un workout por id
    @GetMapping("/{id}")
    public Optional<Workout> getWorkoutById(@PathVariable Long id) {
        return workoutRepository.findById(id);
    }

    // Obtener workouts de un usuario
    @GetMapping("/user/{userId}")
    public List<Workout> getWorkoutsByUser(@PathVariable Long userId) {
        return workoutRepository.findByUserId(userId);
    }

    // Crear workout
    @PostMapping
    public Workout createWorkout(@RequestBody Workout workout) {
        return workoutRepository.save(workout);
    }

    // Actualizar workout
    @PutMapping("/{id}")
    public Workout updateWorkout(@PathVariable Long id, @RequestBody Workout updatedWorkout) {

        return workoutRepository.findById(id).map(workout -> {

            workout.setName(updatedWorkout.getName());
            workout.setStartDate(updatedWorkout.getStartDate());
            workout.setEndDate(updatedWorkout.getEndDate());
            workout.setUser(updatedWorkout.getUser());

            return workoutRepository.save(workout);

        }).orElseThrow(() -> new RuntimeException("Workout not found"));
    }

    // Eliminar workout
    @DeleteMapping("/{id}")
    public void deleteWorkout(@PathVariable Long id) {
        workoutRepository.deleteById(id);
    }


    //Obtener workout completo
    @GetMapping("/full/{id}")
    public Map<String,Object> getFullWorkout(@PathVariable Long id){

        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found"));

        List<WorkoutDay> days = workoutDayRepository.findByWorkoutId(id);

        List<Map<String,Object>> dayList = new ArrayList<>();

        for(WorkoutDay day : days){

            Map<String,Object> dayData = new HashMap<>();

            dayData.put("id",day.getId());
            dayData.put("name",day.getName());
            dayData.put("muscles",day.getMuscles());
            dayData.put("completed",day.getCompleted());

            List<WorkoutExercise> exercises =
                    workoutExerciseRepository.findByWorkoutDayId(day.getId());

            List<Map<String,Object>> exerciseList = new ArrayList<>();

            for(WorkoutExercise ex : exercises){

                Map<String,Object> exData = new HashMap<>();

                exData.put("exerciseId", ex.getExercise().getId());
                exData.put("exerciseName", ex.getExercise().getName());
                exData.put("order", ex.getExerciseOrder());
                exData.put("reps", ex.getReps());
                exData.put("weight", ex.getWeight());
                exData.put("comment", ex.getComment());

                exerciseList.add(exData);
            }

            dayData.put("exercises",exerciseList);
            dayList.add(dayData);
        }

        Map<String,Object> result = new HashMap<>();

        result.put("id",workout.getId());
        result.put("name",workout.getName());
        result.put("startDate",workout.getStartDate());
        result.put("endDate",workout.getEndDate());
        result.put("days",dayList);

        return result;
    }


    //Crear workout completo
    @SuppressWarnings("unchecked")
    @Transactional
    @PostMapping("/full")
    public Workout createFullWorkout(@RequestBody Map<String,Object> body){

        Long userId = Long.valueOf(body.get("userId").toString());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Workout workout = new Workout();
        workout.setName((String) body.get("name"));

        workout.setStartDate(LocalDate.parse(body.get("startDate").toString()));
        workout.setEndDate(LocalDate.parse(body.get("endDate").toString()));
        
        workout.setUser(user);

        workout = workoutRepository.save(workout);

        List<Map<String,Object>> days =
                (List<Map<String,Object>>) body.get("days");

        for(Map<String,Object> dayData : days){

            WorkoutDay day = new WorkoutDay();

            day.setName((String) dayData.get("name"));
            day.setMuscles((String) dayData.get("muscles"));
            day.setWorkout(workout);

            day = workoutDayRepository.save(day);

            List<Map<String,Object>> exercises =
                    (List<Map<String,Object>>) dayData.get("exercises");

            for(Map<String,Object> exData : exercises){

                Long exerciseId =
                        Long.valueOf(exData.get("exerciseId").toString());

                Exercise exercise =
                        exerciseRepository.findById(exerciseId)
                        .orElseThrow();

                WorkoutExercise workoutExercise = new WorkoutExercise();

                workoutExercise.setWorkoutDay(day);
                workoutExercise.setExercise(exercise);

                workoutExercise.setExerciseOrder(
                        Integer.valueOf(exData.get("order").toString())
                );

                workoutExercise.setReps(
                        Integer.valueOf(exData.get("reps").toString())
                );

                workoutExercise.setWeight(
                        Double.valueOf(exData.get("weight").toString())
                );

                workoutExerciseRepository.save(workoutExercise);
            }
        }

        return workout;
    }

    //Editar workout completo
    @SuppressWarnings("unchecked")
    @Transactional
    @PutMapping("/full/{id}")
    public Workout updateFullWorkout(
            @PathVariable Long id,
            @RequestBody Map<String,Object> body){

        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found"));

        workout.setName((String) body.get("name"));

        workout.setStartDate(LocalDate.parse(body.get("startDate").toString()));
        workout.setEndDate(LocalDate.parse(body.get("endDate").toString()));

        workoutRepository.save(workout);

        // eliminar dias existentes
        List<WorkoutDay> existingDays =
                workoutDayRepository.findByWorkoutId(id);

        for(WorkoutDay day : existingDays){
            workoutExerciseRepository.deleteByWorkoutDayId(day.getId());
        }

        workoutDayRepository.deleteByWorkoutId(id);

        // crear dias nuevos
        List<Map<String,Object>> days =
                (List<Map<String,Object>>) body.get("days");

        for(Map<String,Object> dayData : days){

            WorkoutDay day = new WorkoutDay();

            day.setName((String) dayData.get("name"));
            day.setMuscles((String) dayData.get("muscles"));
            day.setWorkout(workout);

            day = workoutDayRepository.save(day);

            List<Map<String,Object>> exercises =
                    (List<Map<String,Object>>) dayData.get("exercises");

            for(Map<String,Object> exData : exercises){

                Long exerciseId =
                        Long.valueOf(exData.get("exerciseId").toString());

                Exercise exercise =
                        exerciseRepository.findById(exerciseId)
                        .orElseThrow(() -> new RuntimeException("Exercise not found"));

                WorkoutExercise workoutExercise = new WorkoutExercise();

                workoutExercise.setWorkoutDay(day);
                workoutExercise.setExercise(exercise);

                workoutExercise.setExerciseOrder(
                        Integer.valueOf(exData.get("order").toString())
                );

                workoutExercise.setReps(
                        Integer.valueOf(exData.get("reps").toString())
                );

                workoutExercise.setWeight(
                        Double.valueOf(exData.get("weight").toString())
                );

                workoutExerciseRepository.save(workoutExercise);
            }
        }

        return workout;
    }

    //Eliminar workout completo
    @Transactional
    @DeleteMapping("/full/{id}")
    public void deleteFullWorkout(@PathVariable Long id){

        List<WorkoutDay> days =
                workoutDayRepository.findByWorkoutId(id);

        for(WorkoutDay day : days){
            workoutExerciseRepository.deleteByWorkoutDayId(day.getId());
        }

        workoutDayRepository.deleteByWorkoutId(id);

        workoutRepository.deleteById(id);
    }

}