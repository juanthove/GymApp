package com.gymapp.service;

import com.gymapp.dto.request.WorkoutFullRequest;
import com.gymapp.dto.request.WorkoutRequest;
import com.gymapp.dto.response.WorkoutFullResponse;
import com.gymapp.dto.response.WorkoutResponse;
import com.gymapp.exception.ResourceNotFoundException;
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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class WorkoutServiceImpl implements WorkoutService {

    private final Path dayImagePath = Paths.get("uploads/day");

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

    @Autowired
    private MuscleService muscleService;

    @Override
    public List<WorkoutResponse> getAllWorkouts() {
        return workoutRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutResponse getWorkoutById(Long id) {
        return toResponse(workoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found")));
    }

    @Override
    public List<WorkoutResponse> getWorkoutsByUser(Long userId) {
        return workoutRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutResponse createWorkout(WorkoutRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Workout workout = new Workout();
        workout.setName(request.name());
        workout.setReps(request.reps());
        workout.setStartDate(request.startDate());
        workout.setEndDate(request.endDate());
        workout.setUser(user);
        return toResponse(workoutRepository.save(workout));
    }

    @Override
    public WorkoutResponse updateWorkout(Long id, WorkoutRequest request) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found"));
        workout.setName(request.name());
        workout.setReps(request.reps());
        workout.setStartDate(request.startDate());
        workout.setEndDate(request.endDate());
        return toResponse(workoutRepository.save(workout));
    }

    @Override
    public void deleteWorkout(Long id) {
        workoutRepository.deleteById(id);
    }

    @Override
    public WorkoutFullResponse getFullWorkout(Long id) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found"));

        List<WorkoutDay> days = workoutDayRepository.findByWorkoutIdOrderByDayOrder(id);
        List<WorkoutFullResponse.DayItem> dayList = new ArrayList<>();

        for (WorkoutDay day : days) {
            List<WorkoutExercise> exercises = workoutExerciseRepository.findByWorkoutDayId(day.getId());
            List<WorkoutFullResponse.ExerciseItem> exerciseList = exercises.stream()
                    .map(ex -> new WorkoutFullResponse.ExerciseItem(
                            ex.getId(), ex.getExercise().getId(), ex.getExercise().getName(),
                            ex.getExerciseOrder(), ex.getWeight(), ex.getComment(), ex.isCompleted()))
                    .toList();
            dayList.add(new WorkoutFullResponse.DayItem(
                    day.getId(), day.getName(), muscleService.getMusclesFromWorkoutDay(day), day.getDayOrder(), day.getMuscleImage(),
                    day.isAbdominal(), day.getStartedAt(), day.getFinishedAt(), day.getStatus(), exerciseList));
        }

        Long userId = workout.getUser() != null ? workout.getUser().getId() : null;
        return new WorkoutFullResponse(workout.getId(), workout.getName(), workout.getReps(),
                workout.getStartDate(), workout.getEndDate(), userId, dayList);
    }

    @Override
    @Transactional
    public WorkoutResponse createFullWorkout(WorkoutFullRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Workout workout = new Workout();
        workout.setName(request.name());
        workout.setReps(request.reps());
        workout.setStartDate(request.startDate());
        workout.setEndDate(request.endDate());
        workout.setUser(user);
        workout = workoutRepository.save(workout);

        for (WorkoutFullRequest.DayItem dayData : request.days()) {
            WorkoutDay day = new WorkoutDay();
            day.setName(dayData.name());
            day.setDayOrder(dayData.dayOrder());
            day.setWorkout(workout);
            day = workoutDayRepository.save(day);
            for (WorkoutFullRequest.ExerciseItem exData : dayData.exercises()) {
                Exercise exercise = exerciseRepository.findById(exData.exerciseId())
                        .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));
                WorkoutExercise workoutExercise = new WorkoutExercise();
                workoutExercise.setWorkoutDay(day);
                workoutExercise.setExercise(exercise);
                workoutExercise.setExerciseOrder(exData.order());
                workoutExercise.setWeight(exData.weight());
                workoutExerciseRepository.save(workoutExercise);
            }
        }
        return toResponse(workout);
    }

    @Override
    @Transactional
    public WorkoutResponse updateFullWorkout(Long id, WorkoutFullRequest request) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found"));
        workout.setName(request.name());
        workout.setReps(request.reps());
        workout.setStartDate(request.startDate());
        workout.setEndDate(request.endDate());
        workoutRepository.save(workout);

        List<WorkoutDay> existingDays = workoutDayRepository.findByWorkoutIdOrderByDayOrder(id);
        for (WorkoutDay day : existingDays) {
            workoutExerciseRepository.deleteByWorkoutDayId(day.getId());
        }
        workoutDayRepository.deleteByWorkoutId(id);

        for (WorkoutFullRequest.DayItem dayData : request.days()) {
            WorkoutDay day = new WorkoutDay();
            day.setName(dayData.name());
            day.setDayOrder(dayData.dayOrder());
            day.setWorkout(workout);
            day = workoutDayRepository.save(day);
            for (WorkoutFullRequest.ExerciseItem exData : dayData.exercises()) {
                Exercise exercise = exerciseRepository.findById(exData.exerciseId())
                        .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));
                WorkoutExercise workoutExercise = new WorkoutExercise();
                workoutExercise.setWorkoutDay(day);
                workoutExercise.setExercise(exercise);
                workoutExercise.setExerciseOrder(exData.order());
                workoutExercise.setWeight(exData.weight());
                workoutExerciseRepository.save(workoutExercise);
            }
        }
        return toResponse(workout);
    }

    @Override
    @Transactional
    public void deleteFullWorkout(Long id) {
        List<WorkoutDay> days = workoutDayRepository.findByWorkoutIdOrderByDayOrder(id);
        for (WorkoutDay day : days) {
            if (day.getMuscleImage() != null) {
                try {
                    Files.deleteIfExists(dayImagePath.resolve(day.getMuscleImage()));
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
            workoutExerciseRepository.deleteByWorkoutDayId(day.getId());
        }
        workoutDayRepository.deleteByWorkoutId(id);
        workoutRepository.deleteById(id);
    }

    private WorkoutResponse toResponse(Workout w) {
        Long userId = w.getUser() != null ? w.getUser().getId() : null;
        return new WorkoutResponse(w.getId(), w.getName(), w.getReps(), w.getStartDate(), w.getEndDate(), userId);
    }
}
