package com.gymapp.service;

import com.gymapp.dto.request.WorkoutDayRequest;
import com.gymapp.dto.response.WorkoutDayExercisesResponse;
import com.gymapp.dto.response.WorkoutDayResponse;
import com.gymapp.dto.response.WorkoutExerciseResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.ExerciseType;
import com.gymapp.model.Workout;
import com.gymapp.model.WorkoutDay;
import com.gymapp.model.WorkoutExercise;
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

    @Autowired
    private com.gymapp.repository.WorkoutExerciseRepository workoutExerciseRepository;

    @Autowired
    private SelectedWorkoutExerciseService selectedWorkoutExerciseService;

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

        //Eliminar json con ejercicios seleccionados
        selectedWorkoutExerciseService.deleteSelectedFile(id);

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

    @Override
    public WorkoutDayExercisesResponse getWorkoutDayExercises(Long dayId) {
        WorkoutDay day = workoutDayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutDay not found"));

        Integer reps = null;
        if (day.getWorkout() != null) {
            reps = day.getWorkout().getReps();
        }

        var exerciseResponses = workoutExerciseRepository.findByWorkoutDayIdOrderByExerciseOrder(dayId)
                .stream()
                .map(this::toWorkoutExerciseResponse)
                .toList();

        return new WorkoutDayExercisesResponse(dayId, reps, exerciseResponses);
    }

    private WorkoutExerciseResponse toWorkoutExerciseResponse(WorkoutExercise exercise) {
        Long dayId = exercise.getWorkoutDay() != null ? exercise.getWorkoutDay().getId() : null;
        Long exerciseId = exercise.getExercise() != null ? exercise.getExercise().getId() : null;
        String exerciseName = exercise.getExercise() != null ? exercise.getExercise().getName() : null;
        String image = exercise.getExercise() != null ? exercise.getExercise().getImage() : null;
        String video = exercise.getExercise() != null ? exercise.getExercise().getVideo() : null;
        boolean selected = dayId != null && exercise.getId() != null && selectedWorkoutExerciseService.isSelected(dayId, exercise.getId());
        ExerciseType type = exercise.getExercise() != null ? exercise.getExercise().getType() : null;
        return new WorkoutExerciseResponse(exercise.getId(), dayId, exerciseId, exerciseName, type,
                exercise.getExerciseOrder(), exercise.getWeight(), exercise.getComment(), exercise.getCompleted(), image, video, selected);
    }

    private WorkoutDayResponse toResponse(WorkoutDay day) {
        Long workoutId = day.getWorkout() != null ? day.getWorkout().getId() : null;
        return new WorkoutDayResponse(day.getId(), day.getName(), day.getMuscles(), day.getDayOrder(),
                day.getAbdominal(), day.getStartedAt(), day.getFinishedAt(), day.getStatus(), workoutId);
    }
}
