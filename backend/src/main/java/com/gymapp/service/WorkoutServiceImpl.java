package com.gymapp.service;

import com.gymapp.model.Exercise;
import com.gymapp.model.User;
import com.gymapp.model.Workout;
import com.gymapp.model.WorkoutDay;
import com.gymapp.model.WorkoutExercise;
import com.gymapp.repository.ExerciseRepository;
import com.gymapp.repository.UserRepository;
import com.gymapp.repository.WorkoutDayRepository;
import com.gymapp.repository.WorkoutExerciseRepository;
import com.gymapp.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class WorkoutServiceImpl implements WorkoutService {

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

    @Override
    public List<Workout> getAllWorkouts() {
        return workoutRepository.findAll();
    }

    @Override
    public Optional<Workout> getWorkoutById(Long id) {
        return workoutRepository.findById(id);
    }

    @Override
    public List<Workout> getWorkoutsByUser(Long userId) {
        return workoutRepository.findByUserId(userId);
    }

    @Override
    public Workout createWorkout(Workout workout) {
        return workoutRepository.save(workout);
    }

    @Override
    public Workout updateWorkout(Long id, Workout updatedWorkout) {
        return workoutRepository.findById(id).map(workout -> {
            workout.setName(updatedWorkout.getName());
            workout.setStartDate(updatedWorkout.getStartDate());
            workout.setEndDate(updatedWorkout.getEndDate());
            workout.setUser(updatedWorkout.getUser());
            return workoutRepository.save(workout);
        }).orElseThrow(() -> new RuntimeException("Workout not found"));
    }

    @Override
    public void deleteWorkout(Long id) {
        workoutRepository.deleteById(id);
    }

    @Override
    public Map<String, Object> getFullWorkout(Long id) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found"));

        List<WorkoutDay> days = workoutDayRepository.findByWorkoutIdOrderByDayOrder(id);
        List<Map<String, Object>> dayList = new ArrayList<>();

        for (WorkoutDay day : days) {
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("id", day.getId());
            dayData.put("name", day.getName());
            dayData.put("muscles", day.getMuscles());
            dayData.put("abdominal", day.getAbdominal());
            dayData.put("startedAt", day.getStartedAt());
            dayData.put("finishedAt", day.getFinishedAt());
            dayData.put("dayOrder", day.getDayOrder());
            dayData.put("status", day.getStatus());

            List<WorkoutExercise> exercises = workoutExerciseRepository.findByWorkoutDayId(day.getId());
            List<Map<String, Object>> exerciseList = new ArrayList<>();

            for (WorkoutExercise ex : exercises) {
                Map<String, Object> exData = new HashMap<>();
                exData.put("exerciseId", ex.getExercise().getId());
                exData.put("exerciseName", ex.getExercise().getName());
                exData.put("order", ex.getExerciseOrder());
                exData.put("weight", ex.getWeight());
                exData.put("comment", ex.getComment());
                exerciseList.add(exData);
            }

            dayData.put("exercises", exerciseList);
            dayList.add(dayData);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("id", workout.getId());
        result.put("name", workout.getName());
        result.put("reps", workout.getReps());
        result.put("startDate", workout.getStartDate());
        result.put("endDate", workout.getEndDate());
        result.put("days", dayList);

        return result;
    }

    @Override
    @SuppressWarnings("unchecked")
    @Transactional
    public Workout createFullWorkout(Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Workout workout = new Workout();
        workout.setName((String) body.get("name"));
        workout.setReps(Integer.valueOf(body.get("reps").toString()));
        workout.setStartDate(LocalDate.parse(body.get("startDate").toString()));
        workout.setEndDate(LocalDate.parse(body.get("endDate").toString()));
        workout.setUser(user);
        workout = workoutRepository.save(workout);

        List<Map<String, Object>> days = (List<Map<String, Object>>) body.get("days");

        for (Map<String, Object> dayData : days) {
            WorkoutDay day = new WorkoutDay();
            day.setName((String) dayData.get("name"));
            day.setMuscles((String) dayData.get("muscles"));
            day.setDayOrder(Integer.valueOf(dayData.get("dayOrder").toString()));
            day.setWorkout(workout);
            day = workoutDayRepository.save(day);

            List<Map<String, Object>> exercises = (List<Map<String, Object>>) dayData.get("exercises");

            for (Map<String, Object> exData : exercises) {
                Long exerciseId = Long.valueOf(exData.get("exerciseId").toString());
                Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
                WorkoutExercise workoutExercise = new WorkoutExercise();
                workoutExercise.setWorkoutDay(day);
                workoutExercise.setExercise(exercise);
                workoutExercise.setExerciseOrder(Integer.valueOf(exData.get("order").toString()));
                workoutExercise.setWeight(Double.valueOf(exData.get("weight").toString()));
                workoutExerciseRepository.save(workoutExercise);
            }
        }

        return workout;
    }

    @Override
    @SuppressWarnings("unchecked")
    @Transactional
    public Workout updateFullWorkout(Long id, Map<String, Object> body) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found"));

        workout.setName((String) body.get("name"));
        workout.setReps(Integer.valueOf(body.get("reps").toString()));
        workout.setStartDate(LocalDate.parse(body.get("startDate").toString()));
        workout.setEndDate(LocalDate.parse(body.get("endDate").toString()));
        workoutRepository.save(workout);

        List<WorkoutDay> existingDays = workoutDayRepository.findByWorkoutIdOrderByDayOrder(id);
        for (WorkoutDay day : existingDays) {
            workoutExerciseRepository.deleteByWorkoutDayId(day.getId());
        }
        workoutDayRepository.deleteByWorkoutId(id);

        List<Map<String, Object>> days = (List<Map<String, Object>>) body.get("days");

        for (Map<String, Object> dayData : days) {
            WorkoutDay day = new WorkoutDay();
            day.setName((String) dayData.get("name"));
            day.setMuscles((String) dayData.get("muscles"));
            day.setDayOrder(Integer.valueOf(dayData.get("dayOrder").toString()));
            day.setWorkout(workout);
            day = workoutDayRepository.save(day);

            List<Map<String, Object>> exercises = (List<Map<String, Object>>) dayData.get("exercises");

            for (Map<String, Object> exData : exercises) {
                Long exerciseId = Long.valueOf(exData.get("exerciseId").toString());
                Exercise exercise = exerciseRepository.findById(exerciseId)
                        .orElseThrow(() -> new RuntimeException("Exercise not found"));
                WorkoutExercise workoutExercise = new WorkoutExercise();
                workoutExercise.setWorkoutDay(day);
                workoutExercise.setExercise(exercise);
                workoutExercise.setExerciseOrder(Integer.valueOf(exData.get("order").toString()));
                workoutExercise.setWeight(Double.valueOf(exData.get("weight").toString()));
                workoutExerciseRepository.save(workoutExercise);
            }
        }

        return workout;
    }

    @Override
    @Transactional
    public void deleteFullWorkout(Long id) {
        List<WorkoutDay> days = workoutDayRepository.findByWorkoutIdOrderByDayOrder(id);
        for (WorkoutDay day : days) {
            workoutExerciseRepository.deleteByWorkoutDayId(day.getId());
        }
        workoutDayRepository.deleteByWorkoutId(id);
        workoutRepository.deleteById(id);
    }
}
