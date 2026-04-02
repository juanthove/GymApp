package com.gymapp.service;

import com.gymapp.dto.request.WorkoutExerciseRequest;
import com.gymapp.dto.response.WorkoutExerciseResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.Exercise;
import com.gymapp.model.ExerciseType;
import com.gymapp.model.MuscleType;
import com.gymapp.model.WorkoutDay;
import com.gymapp.model.WorkoutExercise;
import com.gymapp.repository.ExerciseRepository;
import com.gymapp.repository.WorkoutDayRepository;
import com.gymapp.repository.WorkoutExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkoutExerciseServiceImpl implements WorkoutExerciseService {

    @Autowired
    private WorkoutExerciseRepository workoutExerciseRepository;

    @Autowired
    private WorkoutDayRepository workoutDayRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private SelectedWorkoutExerciseService selectedWorkoutExerciseService;

    @Override
    public List<WorkoutExerciseResponse> getAllWorkoutExercises() {
        return workoutExerciseRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutExerciseResponse getWorkoutExerciseById(Long id) {
        return toResponse(workoutExerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutExercise not found")));
    }

    @Override
    public List<WorkoutExerciseResponse> getExercisesByDay(Long dayId) {
        WorkoutDay day = workoutDayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutDay not found"));

        if (day.getAbdominal()) {
            return workoutExerciseRepository
                    .findByWorkoutDayIdAndExercise_TypeOrderByExerciseOrder(dayId, ExerciseType.ABDOMINAL)
                    .stream().map(this::toResponse).toList();
        }
        return workoutExerciseRepository.findByWorkoutDayIdOrderByExerciseOrder(dayId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutExerciseResponse createWorkoutExercise(WorkoutExerciseRequest request) {
        WorkoutDay day = workoutDayRepository.findById(request.workoutDayId())
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutDay not found"));
        Exercise exercise = exerciseRepository.findById(request.exerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));
        WorkoutExercise workoutExercise = new WorkoutExercise();
        workoutExercise.setWorkoutDay(day);
        workoutExercise.setExercise(exercise);
        workoutExercise.setExerciseOrder(request.exerciseOrder());
        workoutExercise.setWeight(request.weight());
        workoutExercise.setComment(request.comment());
        return toResponse(workoutExerciseRepository.save(workoutExercise));
    }

    @Override
    public WorkoutExerciseResponse updateWorkoutExercise(Long id, WorkoutExerciseRequest request) {
        WorkoutExercise workoutExercise = workoutExerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutExercise not found"));
        WorkoutDay day = workoutDayRepository.findById(request.workoutDayId())
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutDay not found"));
        Exercise exercise = exerciseRepository.findById(request.exerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));
        workoutExercise.setWorkoutDay(day);
        workoutExercise.setExercise(exercise);
        workoutExercise.setExerciseOrder(request.exerciseOrder());
        workoutExercise.setWeight(request.weight());
        workoutExercise.setComment(request.comment());
        return toResponse(workoutExerciseRepository.save(workoutExercise));
    }

    @Override
    public void deleteWorkoutExercise(Long id) {
        workoutExerciseRepository.deleteById(id);
    }

    @Override
    public WorkoutExerciseResponse completeWorkoutExercise(Long id) {
        WorkoutExercise exercise = workoutExerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));
        exercise.setCompleted(true);
        return toResponse(workoutExerciseRepository.save(exercise));
    }

    @Override
    public WorkoutExerciseResponse uncompleteWorkoutExercise(Long id) {
        WorkoutExercise exercise = workoutExerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));
        exercise.setCompleted(false);
        return toResponse(workoutExerciseRepository.save(exercise));
    }

    private WorkoutExerciseResponse toResponse(WorkoutExercise exercise) {
        Long dayId = exercise.getWorkoutDay() != null ? exercise.getWorkoutDay().getId() : null;
        Long exerciseId = exercise.getExercise() != null ? exercise.getExercise().getId() : null;
        String exerciseName = exercise.getExercise() != null ? exercise.getExercise().getName() : null;
        MuscleType exerciseMuscle = exercise.getExercise() != null ? exercise.getExercise().getMuscle() : null;
        String description = exercise.getExercise() != null ? exercise.getExercise().getDescription() : null;
        String image = exercise.getExercise() != null ? exercise.getExercise().getImage() : null;
        String video = exercise.getExercise() != null ? exercise.getExercise().getVideo() : null;
        String icon = exercise.getExercise() != null ? exercise.getExercise().getIcon() : null;
        boolean selected = dayId != null && exercise.getId() != null && selectedWorkoutExerciseService.isSelected(dayId, exercise.getId());
        ExerciseType type = exercise.getExercise() != null ? exercise.getExercise().getType() : null;
        return new WorkoutExerciseResponse(exercise.getId(), dayId, exerciseId, exerciseName, exerciseMuscle, type,
                exercise.getExerciseOrder(), exercise.getWeight(), description, exercise.getComment(), exercise.getCompleted(), image, video, 
                icon, selected);
    }

    @Override
    public void markWorkoutExerciseSelected(Long dayId, Long workoutExerciseId) {
        selectedWorkoutExerciseService.markSelected(dayId, workoutExerciseId);
    }

    @Override
    public void unmarkWorkoutExerciseSelected(Long dayId, Long workoutExerciseId) {
        selectedWorkoutExerciseService.unmarkSelected(dayId, workoutExerciseId);
    }

    @Override
    public boolean isWorkoutExerciseSelected(Long dayId, Long workoutExerciseId) {
        return selectedWorkoutExerciseService.isSelected(dayId, workoutExerciseId);
    }

    @Override
    public void deleteSelectedWorkoutDayFile(Long dayId) {
        selectedWorkoutExerciseService.deleteSelectedFile(dayId);
    }
}
