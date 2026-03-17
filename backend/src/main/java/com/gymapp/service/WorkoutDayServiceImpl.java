package com.gymapp.service;

import com.gymapp.dto.request.WorkoutDayRequest;
import com.gymapp.dto.response.WorkoutDayResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.Workout;
import com.gymapp.model.WorkoutDay;
import com.gymapp.repository.WorkoutDayRepository;
import com.gymapp.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkoutDayServiceImpl implements WorkoutDayService {

    @Autowired
    private WorkoutDayRepository workoutDayRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Override
    public List<WorkoutDayResponse> getAllWorkoutDays() {
        return workoutDayRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutDayResponse getWorkoutDayById(Long id) {
        return toResponse(workoutDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutDay not found")));
    }

    @Override
    public List<WorkoutDayResponse> getDaysByWorkout(Long workoutId) {
        return workoutDayRepository.findByWorkoutIdOrderByDayOrder(workoutId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutDayResponse createWorkoutDay(WorkoutDayRequest request) {
        Workout workout = workoutRepository.findById(request.workoutId())
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found"));
        WorkoutDay workoutDay = new WorkoutDay();
        workoutDay.setName(request.name());
        workoutDay.setMuscles(request.muscles());
        workoutDay.setDayOrder(request.dayOrder());
        workoutDay.setWorkout(workout);
        return toResponse(workoutDayRepository.save(workoutDay));
    }

    @Override
    public WorkoutDayResponse updateWorkoutDay(Long id, WorkoutDayRequest request) {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutDay not found"));
        day.setName(request.name());
        day.setMuscles(request.muscles());
        day.setDayOrder(request.dayOrder());
        return toResponse(workoutDayRepository.save(day));
    }

    @Override
    public void deleteWorkoutDay(Long id) {
        workoutDayRepository.deleteById(id);
    }

    @Override
    public WorkoutDayResponse startWorkoutDay(Long id) {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout day not found"));
        day.setStartedAt(LocalDateTime.now());
        return toResponse(workoutDayRepository.save(day));
    }

    @Override
    public WorkoutDayResponse completeWorkoutDay(Long id) {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout day not found"));
        day.setFinishedAt(LocalDateTime.now());
        return toResponse(workoutDayRepository.save(day));
    }

    @Override
    public WorkoutDayResponse markAbdominalWorkoutDay(Long id) {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout day not found"));
        day.setAbdominal(true);
        return toResponse(workoutDayRepository.save(day));
    }

    @Override
    public boolean isAbdominalDay(Long id) {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutDay not found"));
        return day.getAbdominal();
    }

    @Override
    public String getWorkoutDayStatus(Long id) {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutDay not found"));
        if (day.getStartedAt() == null) return "NOT_STARTED";
        if (day.getFinishedAt() == null) return "IN_PROGRESS";
        return "COMPLETED";
    }

    private WorkoutDayResponse toResponse(WorkoutDay day) {
        Long workoutId = day.getWorkout() != null ? day.getWorkout().getId() : null;
        return new WorkoutDayResponse(day.getId(), day.getName(), day.getMuscles(), day.getDayOrder(),
                day.getAbdominal(), day.getStartedAt(), day.getFinishedAt(), day.getStatus(), workoutId);
    }
}
