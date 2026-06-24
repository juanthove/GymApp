package com.gymapp.service;

import com.gymapp.dto.request.WorkoutSaveRequest;
import com.gymapp.dto.response.WorkoutSaveResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.Workout;
import com.gymapp.model.WorkoutSave;
import com.gymapp.repository.WorkoutRepository;
import com.gymapp.repository.WorkoutSaveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkoutSaveServiceImpl implements WorkoutSaveService {

    @Autowired
    private WorkoutSaveRepository workoutSaveRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Override
    public List<WorkoutSaveResponse> getAllWorkoutSaves() {
        return workoutSaveRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutSaveResponse getWorkoutSaveById(Long id) {
        WorkoutSave workoutSave = workoutSaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutSave not found"));
        return toResponse(workoutSave);
    }

    @Override
    public List<WorkoutSaveResponse> getWorkoutSavesByWorkout(Long workoutId) {
        return workoutSaveRepository.findByWorkoutId(workoutId).stream().map(this::toResponse).toList();
    }

    @Override
    public List<WorkoutSaveResponse> getWorkoutSavesByUser(Long userId) {
        return workoutSaveRepository.findByWorkoutUserId(userId).stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutSaveResponse createWorkoutSave(WorkoutSaveRequest request) {
        Workout workout = workoutRepository.findById(request.workoutId())
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found"));

        WorkoutSave workoutSave = new WorkoutSave();
        workoutSave.setName(request.name());
        workoutSave.setWorkout(workout);

        return toResponse(workoutSaveRepository.save(workoutSave));
    }

    @Override
    public WorkoutSaveResponse updateWorkoutSave(Long id, WorkoutSaveRequest request) {
        WorkoutSave workoutSave = workoutSaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutSave not found"));

        Workout workout = workoutRepository.findById(request.workoutId())
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found"));

        workoutSave.setName(request.name());
        workoutSave.setWorkout(workout);

        return toResponse(workoutSaveRepository.save(workoutSave));
    }

    @Override
    public void deleteWorkoutSave(Long id) {
        workoutSaveRepository.deleteById(id);
    }

    private WorkoutSaveResponse toResponse(WorkoutSave workoutSave) {
        return new WorkoutSaveResponse(
                workoutSave.getId(),
                workoutSave.getName(),
                workoutSave.getWorkout() != null ? workoutSave.getWorkout().getId() : null);
    }
}
