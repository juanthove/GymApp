package com.gymapp.service;

import com.gymapp.dto.request.WorkoutSetRequest;
import com.gymapp.dto.response.WorkoutSetResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.User;
import com.gymapp.model.WorkoutExercise;
import com.gymapp.model.WorkoutSet;
import com.gymapp.repository.UserRepository;
import com.gymapp.repository.WorkoutExerciseRepository;
import com.gymapp.repository.WorkoutSetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkoutSetServiceImpl implements WorkoutSetService {

    @Autowired
    private WorkoutSetRepository workoutSetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkoutExerciseRepository workoutExerciseRepository;

    @Override
    public List<WorkoutSetResponse> getAllWorkoutSets() {
        return workoutSetRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutSetResponse getWorkoutSetById(Long id) {
        return toResponse(workoutSetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutSet not found")));
    }

    @Override
    public List<WorkoutSetResponse> getWorkoutSetsByUser(Long userId) {
        return workoutSetRepository.findByUserIdOrderBySetNumber(userId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<WorkoutSetResponse> getWorkoutSetsByWorkoutExercise(Long workoutExerciseId) {
        return workoutSetRepository.findByWorkoutExerciseIdOrderBySetNumber(workoutExerciseId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutSetResponse createWorkoutSet(WorkoutSetRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        WorkoutExercise workoutExercise = workoutExerciseRepository.findById(request.workoutExerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutExercise not found"));

        WorkoutSet workoutSet = new WorkoutSet();
        workoutSet.setUser(user);
        workoutSet.setExercise(workoutExercise);
        workoutSet.setSetNumber(request.setNumber());
        workoutSet.setReps(request.reps());
        workoutSet.setWeight(request.weight());

        return toResponse(workoutSetRepository.save(workoutSet));
    }

    @Override
    public WorkoutSetResponse updateWorkoutSet(Long id, WorkoutSetRequest request) {
        WorkoutSet workoutSet = workoutSetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutSet not found"));

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        WorkoutExercise workoutExercise = workoutExerciseRepository.findById(request.workoutExerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutExercise not found"));

        workoutSet.setUser(user);
        workoutSet.setExercise(workoutExercise);
        workoutSet.setSetNumber(request.setNumber());
        workoutSet.setReps(request.reps());
        workoutSet.setWeight(request.weight());

        return toResponse(workoutSetRepository.save(workoutSet));
    }

    @Override
    public void deleteWorkoutSet(Long id) {
        workoutSetRepository.deleteById(id);
    }

    private WorkoutSetResponse toResponse(WorkoutSet workoutSet) {
        Long userId = workoutSet.getUser() != null ? workoutSet.getUser().getId() : null;
        Long workoutExerciseId = workoutSet.getExercise() != null ? workoutSet.getExercise().getId() : null;

        return new WorkoutSetResponse(
                workoutSet.getId(),
                userId,
                workoutExerciseId,
                workoutSet.getSetNumber(),
                workoutSet.getReps(),
                workoutSet.getWeight()
        );
    }
}
