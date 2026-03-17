package com.gymapp.service;

import com.gymapp.model.WorkoutDay;
import com.gymapp.repository.WorkoutDayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WorkoutDayServiceImpl implements WorkoutDayService {

    @Autowired
    private WorkoutDayRepository workoutDayRepository;

    @Override
    public List<WorkoutDay> getAllWorkoutDays() {
        return workoutDayRepository.findAll();
    }

    @Override
    public Optional<WorkoutDay> getWorkoutDayById(Long id) {
        return workoutDayRepository.findById(id);
    }

    @Override
    public List<WorkoutDay> getDaysByWorkout(Long workoutId) {
        return workoutDayRepository.findByWorkoutIdOrderByDayOrder(workoutId);
    }

    @Override
    public WorkoutDay createWorkoutDay(WorkoutDay workoutDay) {
        return workoutDayRepository.save(workoutDay);
    }

    @Override
    public WorkoutDay updateWorkoutDay(Long id, WorkoutDay updatedDay) {
        return workoutDayRepository.findById(id).map(day -> {
            day.setName(updatedDay.getName());
            day.setMuscles(updatedDay.getMuscles());
            day.setWorkout(updatedDay.getWorkout());
            return workoutDayRepository.save(day);
        }).orElseThrow(() -> new RuntimeException("WorkoutDay not found"));
    }

    @Override
    public void deleteWorkoutDay(Long id) {
        workoutDayRepository.deleteById(id);
    }

    @Override
    public WorkoutDay startWorkoutDay(Long id) {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout day not found"));
        day.setStartedAt(LocalDateTime.now());
        return workoutDayRepository.save(day);
    }

    @Override
    public WorkoutDay completeWorkoutDay(Long id) {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout day not found"));
        day.setFinishedAt(LocalDateTime.now());
        return workoutDayRepository.save(day);
    }

    @Override
    public WorkoutDay markAbdominalWorkoutDay(Long id) {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout day not found"));
        day.setAbdominal(true);
        return workoutDayRepository.save(day);
    }

    @Override
    public boolean isAbdominalDay(Long id) {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkoutDay not found"));
        return day.getAbdominal();
    }

    @Override
    public String getWorkoutDayStatus(Long id) {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkoutDay not found"));
        if (day.getStartedAt() == null) return "NOT_STARTED";
        if (day.getFinishedAt() == null) return "IN_PROGRESS";
        return "COMPLETED";
    }
}
