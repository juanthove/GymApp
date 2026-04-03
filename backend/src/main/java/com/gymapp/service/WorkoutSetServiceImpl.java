package com.gymapp.service;

import com.gymapp.dto.request.WorkoutSetRequest;
import com.gymapp.dto.response.WorkoutSetResponse;
import com.gymapp.dto.response.WorkoutSetVolumeResponse;
import com.gymapp.dto.response.WorkoutSetWeeklyMuscleVolumeResponse;
import com.gymapp.dto.response.WorkoutSetVolumePointResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.Granularity;
import com.gymapp.model.MuscleType;
import com.gymapp.model.User;
import com.gymapp.model.WorkoutDay;
import com.gymapp.model.WorkoutExercise;
import com.gymapp.model.WorkoutSet;
import com.gymapp.repository.WorkoutExerciseRepository;
import com.gymapp.repository.WorkoutSetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkoutSetServiceImpl implements WorkoutSetService {

    @Autowired
    private WorkoutSetRepository workoutSetRepository;

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

    private List<WorkoutSet> getSetsByDateFilter(Long userId, LocalDate from, LocalDate to) {
    if (from != null && to != null) {
        return workoutSetRepository.findByUserIdAndPerformedAtBetweenOrderByPerformedAtAscSetNumberAsc(
            userId, from.atStartOfDay(), to.atTime(LocalTime.MAX)
        );
    } else if (from != null) {
        return workoutSetRepository.findByUserIdAndPerformedAtAfterOrderByPerformedAtAscSetNumberAsc(
            userId, from.atStartOfDay()
        );
    } else if (to != null) {
        return workoutSetRepository.findByUserIdAndPerformedAtBeforeOrderByPerformedAtAscSetNumberAsc(
            userId, to.atTime(LocalTime.MAX)
        );
    } else {
        return workoutSetRepository.findByUserIdOrderByPerformedAtAscSetNumberAsc(userId);
    }
}

    @Override
    public List<WorkoutSetResponse> getWorkoutSetsByUserAndDateRange(Long userId, LocalDate from, LocalDate to) {

        List<WorkoutSet> sets = getSetsByDateFilter(userId, from, to);

        return sets.stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutSetVolumeResponse getTotalVolumeByUserAndDateRange(Long userId, LocalDate from, LocalDate to) {

        List<WorkoutSet> sets = getSetsByDateFilter(userId, from, to);

        double totalVolume = sets.stream()
            .mapToDouble(this::calculateSetVolume)
            .sum();

        return new WorkoutSetVolumeResponse(userId, from, to, totalVolume);
    }

    @Override
    public List<WorkoutSetWeeklyMuscleVolumeResponse> getWeeklyMuscleVolumeByUserAndDateRange(Long userId, LocalDate from, LocalDate to) {

        List<WorkoutSet> sets = getSetsByDateFilter(userId, from, to);

        Map<WeekMuscleKey, Double> grouped = sets.stream()
            .collect(Collectors.groupingBy(
                set -> new WeekMuscleKey(resolveWeekStart(set), resolveMuscle(set)),
                Collectors.summingDouble(this::calculateSetVolume)
            ));

        return grouped.entrySet().stream()
            .map(entry -> new WorkoutSetWeeklyMuscleVolumeResponse(
                entry.getKey().weekStart(),
                entry.getKey().weekStart().plusDays(6),
                entry.getKey().muscle(),
                entry.getValue()
            ))
            .sorted(Comparator
                .comparing(WorkoutSetWeeklyMuscleVolumeResponse::weekStart)
                .thenComparing(item -> item.muscle() != null ? item.muscle().name() : "")
            )
            .toList();
    }

    private LocalDate resolveDateByGranularity(WorkoutSet set, Granularity granularity) {

        LocalDate date = set.getPerformedAt().toLocalDate();

        return switch (granularity) {
            case DAY -> date;

            case WEEK -> date.with(java.time.DayOfWeek.MONDAY);

            case MONTH -> date.withDayOfMonth(1);
        };
    }

    private Granularity resolveGranularity(List<WorkoutSet> sets, LocalDate from, LocalDate to, Granularity requested) {
        if (from == null && to == null && !sets.isEmpty()) {

            LocalDate minDate = sets.get(0).getPerformedAt().toLocalDate();
            LocalDate maxDate = sets.get(sets.size() - 1).getPerformedAt().toLocalDate();

            long days = ChronoUnit.DAYS.between(minDate, maxDate);

            if (days <= 30) return Granularity.DAY;
            if (days <= 180) return Granularity.WEEK;
            return Granularity.MONTH;
        }

        return requested;
    }

    @Override
    public List<WorkoutSetVolumePointResponse> getVolumeSeriesByUserAndDateRange(Long userId, LocalDate from, LocalDate to, 
        Granularity granularity) {

        List<WorkoutSet> sets = getSetsByDateFilter(userId, from, to);

        Granularity resolvedGranularity = resolveGranularity(sets, from, to, granularity);

        Map<LocalDate, Double> grouped = sets.stream()
                .collect(Collectors.groupingBy(
                        set -> resolveDateByGranularity(set, resolvedGranularity),
                        Collectors.summingDouble(this::calculateSetVolume)
                ));

        return grouped.entrySet().stream()
                .map(entry -> new WorkoutSetVolumePointResponse(
                        entry.getKey(),
                        entry.getValue()
                ))
                .sorted(Comparator.comparing(WorkoutSetVolumePointResponse::date))
                .toList();
    }

    @Override
    public List<WorkoutSetResponse> getWorkoutSetsByWorkoutExercise(Long workoutExerciseId) {
        return workoutSetRepository.findByWorkoutExerciseIdOrderBySetNumber(workoutExerciseId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutSetResponse createWorkoutSet(WorkoutSetRequest request) {
        WorkoutExercise workoutExercise = workoutExerciseRepository.findById(request.workoutExerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutExercise not found"));

        User user = resolveUserFromWorkoutExercise(workoutExercise);

        WorkoutSet workoutSet = new WorkoutSet();
        workoutSet.setUser(user);
        workoutSet.setExercise(workoutExercise);
        workoutSet.setSetNumber(request.setNumber());
        workoutSet.setReps(request.reps());
        workoutSet.setWeight(request.weight());
        workoutSet.setPerformedAt(LocalDateTime.now());

        return toResponse(workoutSetRepository.save(workoutSet));
    }

    @Override
    public WorkoutSetResponse updateWorkoutSet(Long id, WorkoutSetRequest request) {
        WorkoutSet workoutSet = workoutSetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutSet not found"));

        WorkoutExercise workoutExercise = workoutExerciseRepository.findById(request.workoutExerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutExercise not found"));

        User user = resolveUserFromWorkoutExercise(workoutExercise);

        workoutSet.setUser(user);
        workoutSet.setExercise(workoutExercise);
        workoutSet.setSetNumber(request.setNumber());
        workoutSet.setReps(request.reps());
        workoutSet.setWeight(request.weight());
        if (workoutSet.getPerformedAt() == null) {
            workoutSet.setPerformedAt(LocalDateTime.now());
        }

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
                workoutSet.getWeight(),
                workoutSet.getPerformedAt()
        );
    }

    private User resolveUserFromWorkoutExercise(WorkoutExercise workoutExercise) {
        WorkoutDay workoutDay = workoutExercise.getWorkoutDay();
        if (workoutDay == null || workoutDay.getWorkout() == null || workoutDay.getWorkout().getUser() == null) {
            throw new ResourceNotFoundException("User not found from workout exercise");
        }

        return workoutDay.getWorkout().getUser();
    }

    private double calculateSetVolume(WorkoutSet set) {
        int reps = set.getReps() != null ? set.getReps() : 0;
        double weight = set.getWeight() != null ? set.getWeight() : 0.0;
        return reps * weight;
    }

    private LocalDate resolveWeekStart(WorkoutSet set) {
        LocalDate date = (set.getPerformedAt() != null ? set.getPerformedAt() : LocalDateTime.now()).toLocalDate();
        return date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    private MuscleType resolveMuscle(WorkoutSet set) {
        if (set.getExercise() == null || set.getExercise().getExercise() == null) {
            return null;
        }
        return set.getExercise().getExercise().getMuscle();
    }

    private record WeekMuscleKey(LocalDate weekStart, MuscleType muscle) {}
}
