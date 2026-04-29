package com.gymapp.service;

import com.gymapp.dto.request.WorkoutSetRequest;
import com.gymapp.dto.response.WorkoutDayMuscleVolumeResponse;
import com.gymapp.dto.response.WorkoutSetResponse;
import com.gymapp.dto.response.WorkoutSetVolumeResponse;
import com.gymapp.dto.response.WorkoutSetWeeklyMuscleVolumeResponse;
import com.gymapp.dto.response.WorkoutSetVolumePointResponse;
import com.gymapp.dto.response.WorkoutVolumeResponse;
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
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;
import java.sql.Timestamp;
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

    private List<WorkoutSet> filterByMuscle(List<WorkoutSet> sets, MuscleType muscle) {
        if (muscle == null) return sets;

        return sets.stream()
            .filter(set -> muscle.equals(resolveMuscle(set)))
            .toList();
    }

    @Override
    public WorkoutSetVolumeResponse getTotalVolumeByUserAndDateRange(Long userId, LocalDate from, LocalDate to, MuscleType muscle) {

        List<WorkoutSet> sets = getSetsByDateFilter(userId, from, to);

        sets = filterByMuscle(sets, muscle);

        double totalVolume = sets.stream()
            .mapToDouble(this::calculateSetVolume)
            .sum();

        return new WorkoutSetVolumeResponse(userId, from, to, totalVolume);
    }


    @Override
    public List<WorkoutSetWeeklyMuscleVolumeResponse> getWeeklyMuscleVolumeByUserAndDateRange(
        Long userId,
        LocalDate from,
        LocalDate to
    ) {

        List<Object[]> rows = workoutSetRepository.findWeeklyVolumeWithHistoricalMax(
            userId,
            from != null ? from.atStartOfDay() : null,
            to != null ? to.atTime(LocalTime.MAX) : null
        );

        List<WorkoutSetWeeklyMuscleVolumeResponse> result = new ArrayList<>();

        for (Object[] row : rows) {
            String muscleStr = (String) row[0];
            LocalDateTime weekStart = ((Timestamp) row[1]).toLocalDateTime();
            Double weeklyVolume = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
            Double historicalMax = row[3] != null ? ((Number) row[3]).doubleValue() : 0.0;

            MuscleType muscle = MuscleType.valueOf(muscleStr);

            result.add(new WorkoutSetWeeklyMuscleVolumeResponse(
                weekStart.toLocalDate(),
                weekStart.toLocalDate().plusDays(6),
                muscle,
                weeklyVolume,
                historicalMax
            ));
        }

        result.sort((a, b) -> {
            // 🔹 1. comparar por semana (desc)
            int cmpWeek = b.weekStart().compareTo(a.weekStart());
            if (cmpWeek != 0) return cmpWeek;

            // 🔹 2. comparar por orden del enum
            return Integer.compare(
                a.muscle().ordinal(),
                b.muscle().ordinal()
            );
        });
        return result;
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

        if (requested != null) {
            return requested;
        }

        if (!sets.isEmpty()) {

            LocalDate minDate = sets.get(0).getPerformedAt().toLocalDate();
            LocalDate maxDate = sets.get(sets.size() - 1).getPerformedAt().toLocalDate();

            long days = ChronoUnit.DAYS.between(minDate, maxDate);

            if (days <= 30) return Granularity.DAY;
            if (days <= 180) return Granularity.WEEK;
            return Granularity.MONTH;
        }

        return Granularity.DAY;
    }

    @Override
    public WorkoutVolumeResponse getVolumeSeriesByUserAndDateRange(Long userId, LocalDate from, LocalDate to, 
        Granularity granularity, MuscleType muscle) {

        List<WorkoutSet> sets = getSetsByDateFilter(userId, from, to);

        sets = filterByMuscle(sets, muscle);

        Granularity resolvedGranularity = resolveGranularity(sets, from, to, granularity);

        Map<LocalDate, Double> grouped = sets.stream()
                .collect(Collectors.groupingBy(
                        set -> resolveDateByGranularity(set, resolvedGranularity),
                        Collectors.summingDouble(this::calculateSetVolume)
                ));

        List<WorkoutSetVolumePointResponse> data = grouped.entrySet().stream()
                .map(entry -> new WorkoutSetVolumePointResponse(
                        entry.getKey(),
                        entry.getValue()
                ))
                .sorted(Comparator.comparing(WorkoutSetVolumePointResponse::date))
                .toList();
        
        return new WorkoutVolumeResponse(resolvedGranularity, data);
    }

    @Override
    public Double getTotalVolumeByDay(Long userId, Long dayId) {
        Double volume = workoutSetRepository.getTotalVolumeByDay(userId, dayId);
        return volume != null ? volume : 0.0;
    }

    @Override
    public int getTotalExercisesByDay(Long userId, Long dayId) {
        Integer total = workoutSetRepository.countExercisesByDayCustom(userId, dayId);
        return total != null ? total : 0;
    }

    @Override
    public List<WorkoutDayMuscleVolumeResponse> getMuscleVolumeByDay(
        Long userId,
        Long dayId
    ) {
        List<Object[]> rows = workoutSetRepository.findVolumeByDayId(userId, dayId);

        List<WorkoutDayMuscleVolumeResponse> result = new ArrayList<>();

        for (Object[] row : rows) {
            String muscleStr = (String) row[0];
            Double volume = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;

            result.add(new WorkoutDayMuscleVolumeResponse(
                MuscleType.valueOf(muscleStr),
                volume
            ));
        }

        return result;
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

    private MuscleType resolveMuscle(WorkoutSet set) {
        if (set.getExercise() == null || set.getExercise().getExercise() == null) {
            return null;
        }
        return set.getExercise().getExercise().getMuscle();
    }

}
