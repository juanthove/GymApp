package com.gymapp.service;

import com.gymapp.dto.request.WorkoutDayRequest;
import com.gymapp.dto.response.ExerciseAlertResponse;
import com.gymapp.dto.response.RuleAlertResponse;
import com.gymapp.dto.response.TrainingSummaryResponse;
import com.gymapp.dto.response.WorkoutDayCountResponse;
import com.gymapp.dto.response.WorkoutDayExercisesResponse;
import com.gymapp.dto.response.WorkoutDayResponse;
import com.gymapp.dto.response.WorkoutDaySummaryResponse;
import com.gymapp.dto.response.WorkoutExerciseResponse;
import com.gymapp.dto.response.WorkoutFrequencyResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.User;
import com.gymapp.model.Exercise;
import com.gymapp.model.ExerciseReminderRule;
import com.gymapp.model.ExerciseType;
import com.gymapp.model.Granularity;
import com.gymapp.model.MuscleType;
import com.gymapp.model.Workout;
import com.gymapp.model.WorkoutDay;
import com.gymapp.model.WorkoutExercise;
import com.gymapp.repository.ExerciseReminderRuleRepository;
import com.gymapp.repository.WorkoutDayRepository;
import com.gymapp.repository.WorkoutRepository;
import com.gymapp.repository.WorkoutExerciseRepository;
import com.gymapp.repository.templates.WorkoutTemplateDayRepository;
import com.gymapp.repository.projection.WorkoutDayCountProjection;
import com.gymapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Map;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Objects;

@Service
public class WorkoutDayServiceImpl implements WorkoutDayService {

    private final Path dayImagePath = Paths.get("uploads/day");

    @Autowired
    private WorkoutDayRepository workoutDayRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private WorkoutExerciseRepository workoutExerciseRepository;

    @Autowired
    private SelectedWorkoutExerciseService selectedWorkoutExerciseService;

    @Autowired
    private MuscleService muscleService;

    @Autowired
    private WorkoutSetService workoutSetService;

    @Autowired
    private ExerciseReminderRuleRepository exerciseReminderRuleRepository;

    @Autowired
    private UserAchievementService userAchievementService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkoutTemplateDayRepository workoutTemplateDayRepository;

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
        workoutDay.setDayOrder(request.dayOrder());
        workoutDay.setWorkout(workout);
        return toResponse(workoutDayRepository.save(workoutDay));
    }

    @Override
    public WorkoutDayResponse updateWorkoutDay(Long id, WorkoutDayRequest request) {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutDay not found"));
        day.setName(request.name());
        day.setDayOrder(request.dayOrder());
        return toResponse(workoutDayRepository.save(day));
    }

    @Override
    public WorkoutDayResponse setMuscleImage(Long id, MultipartFile file) throws IOException {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutDay not found"));

        Files.createDirectories(dayImagePath);

        String previousImage = day.getMuscleImage();

        String original = file.getOriginalFilename();
        if (original == null || !original.contains(".")) {
            throw new RuntimeException("Archivo invalido");
        }

        String ext = original.substring(original.lastIndexOf("."));
        String fileName = UUID.randomUUID() + ext;

        Files.copy(file.getInputStream(), dayImagePath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

        day.setMuscleImage(fileName);
        WorkoutDay saved = workoutDayRepository.save(day);

        deleteImageIfUnused(previousImage, saved.getId(), null);

        return toResponse(saved);
    }

    @Override
    public WorkoutDayResponse deleteMuscleImage(Long id) throws IOException {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutDay not found"));

        String previousImage = day.getMuscleImage();

        if (day.getMuscleImage() != null) {
            day.setMuscleImage(null);
        }

        WorkoutDay saved = workoutDayRepository.save(day);

        deleteImageIfUnused(previousImage, saved.getId(), null);

        return toResponse(saved);
    }

    @Override
    public ResponseEntity<Resource> getMuscleImage(String filename) throws IOException {
        Path filePath = dayImagePath.resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new ResourceNotFoundException("Imagen no encontrada");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, Files.probeContentType(filePath))
                .body(resource);
    }

    @Override
    public void deleteImageByFilename(String filename) throws IOException {
        deleteImageIfUnused(filename, null, null);
    }

    @Override
    public void deleteWorkoutDay(Long id) {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutDay not found"));

        String imageName = day.getMuscleImage();

        workoutDayRepository.deleteById(id);

        try {
            deleteImageIfUnused(imageName, null, null);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void deleteImageIfUnused(String filename, Long excludeWorkoutDayId, Long excludeTemplateDayId)
            throws IOException {
        if (filename == null || filename.isBlank()) {
            return;
        }

        long workoutRefs = excludeWorkoutDayId != null
                ? workoutDayRepository.countByMuscleImageAndIdNot(filename, excludeWorkoutDayId)
                : workoutDayRepository.countByMuscleImage(filename);

        long templateRefs = excludeTemplateDayId != null
                ? workoutTemplateDayRepository.countByMuscleImageAndIdNot(filename, excludeTemplateDayId)
                : workoutTemplateDayRepository.countByMuscleImage(filename);

        if (workoutRefs + templateRefs > 0) {
            return;
        }

        Files.deleteIfExists(dayImagePath.resolve(filename).normalize());
    }

    @Override
    public WorkoutDayResponse startWorkoutDay(Long id) {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout day not found"));
        day.setStartedAt(LocalDateTime.now());
        return toResponse(workoutDayRepository.save(day));
    }

    @Override
    public WorkoutDayResponse cancelWorkoutDay(Long id) {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout day not found"));
        day.setStartedAt(null);

        return toResponse(workoutDayRepository.save(day));
    }

    @Override
    public WorkoutDayResponse completeWorkoutDay(Long id) {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout day not found"));
        day.setFinishedAt(LocalDateTime.now());

        // Eliminar json con ejercicios seleccionados
        selectedWorkoutExerciseService.deleteSelectedFile(id);

        // Obtener usuario
        User user = day.getWorkout().getUser();

        // Actualizar stats del usuario (streak, totalDays, etc)
        userService.updateUserStats(user, LocalDate.now());

        // Actualizar achievements
        userAchievementService.updateAchievements(user, id);

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
        return day.isAbdominal();
    }

    @Override
    public String getWorkoutDayStatus(Long id) {
        WorkoutDay day = workoutDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutDay not found"));
        if (day.getStartedAt() == null)
            return "NOT_STARTED";
        if (day.getFinishedAt() == null)
            return "IN_PROGRESS";
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

        List<Long> selectedIds = selectedWorkoutExerciseService.getSelectedIds(dayId);

        // Traer ejercicios una sola vez
        List<WorkoutExercise> exercises = workoutExerciseRepository
                .findByWorkoutDayIdOrderByExerciseOrder(dayId);

        // Obtengo todos los exerciseId
        List<Long> exerciseIds = exercises.stream()
                .map(ex -> ex.getExercise().getId())
                .distinct()
                .toList();

        // Query que obtiene última fecha realizada
        List<Object[]> rows = workoutExerciseRepository.findLastCompletedDates(
                day.getWorkout().getId(),
                dayId,
                exerciseIds);

        // Map<exerciseId, lastPerformedDate>
        Map<Long, LocalDate> lastPerformedMap = rows.stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> ((LocalDateTime) row[1]).toLocalDate()));

        var exerciseResponses = exercises.stream()
                .map(ex -> toWorkoutExerciseResponse(
                        ex,
                        lastPerformedMap.get(ex.getExercise().getId())))
                .toList();

        // Obtener las alertas
        Long userId = day.getWorkout().getUser().getId();

        List<RuleAlertResponse> alerts = buildRuleAlerts(userId, exerciseIds);

        return new WorkoutDayExercisesResponse(
                dayId,
                reps,
                selectedIds,
                exerciseResponses,
                alerts);
    }

    private LocalDate resolveDate(LocalDate date, Granularity granularity) {
        return switch (granularity) {
            case DAY -> date;
            case WEEK -> date.with(java.time.DayOfWeek.MONDAY);
            case MONTH -> date.withDayOfMonth(1);
        };
    }

    private Granularity resolveGranularity(List<LocalDate> dates, Granularity requested) {

        if (requested != null) {
            return requested;
        }

        if (!dates.isEmpty()) {

            LocalDate minDate = dates.get(0);
            LocalDate maxDate = dates.get(dates.size() - 1);

            long days = ChronoUnit.DAYS.between(minDate, maxDate);

            if (days <= 180)
                return Granularity.WEEK;
            return Granularity.MONTH;
        }

        return Granularity.DAY;
    }

    @Override
    public WorkoutFrequencyResponse getWorkoutFrequency(
            Long userId,
            LocalDate from,
            LocalDate to,
            Granularity granularity) {

        List<WorkoutDayCountProjection> rawData = workoutDayRepository.countWorkoutDaysByDate(userId);

        List<WorkoutDayCountResponse> result = rawData.stream()
                .map(d -> new WorkoutDayCountResponse(
                        d.getDate(),
                        d.getCount()))
                .toList();

        if (from != null) {
            result = result.stream()
                    .filter(d -> !d.date().isBefore(from))
                    .toList();
        }

        if (to != null) {
            result = result.stream()
                    .filter(d -> !d.date().isAfter(to))
                    .toList();
        }

        List<LocalDate> dates = result.stream()
                .map(WorkoutDayCountResponse::date)
                .toList();

        Granularity resolvedGranularity = resolveGranularity(dates, granularity);

        // Agrupar según granularidad
        Map<LocalDate, Long> grouped = result.stream()
                .collect(Collectors.groupingBy(
                        item -> resolveDate(item.date(), resolvedGranularity),
                        Collectors.summingLong(WorkoutDayCountResponse::count)));

        List<WorkoutDayCountResponse> data = grouped.entrySet().stream()
                .map(e -> new WorkoutDayCountResponse(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(WorkoutDayCountResponse::date))
                .toList();

        return new WorkoutFrequencyResponse(resolvedGranularity, data);
    }

    private List<WorkoutDayCountResponse> getWorkoutDays(Long userId) {
        return workoutDayRepository
                .countWorkoutDaysByDate(userId)
                .stream()
                .map(d -> new WorkoutDayCountResponse(
                        d.getDate(),
                        d.getCount()))
                .toList();
    }

    @Override
    public TrainingSummaryResponse getTrainingSummary(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        int currentStreak = 0;

        if (user.getStreakStartDate() != null) {
            currentStreak = (int) ChronoUnit.DAYS.between(
                    user.getStreakStartDate(),
                    LocalDate.now()) + 1;
        }

        return new TrainingSummaryResponse(
                currentStreak,
                getWorkoutDays(userId));
    }

    @Override
    public WorkoutDaySummaryResponse getWorkoutDaySummary(Long userId, Long dayId) {

        WorkoutDay day = workoutDayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout day not found"));

        // Duración
        Long duration = 0L;

        if (day.getStartedAt() != null && day.getFinishedAt() != null) {
            duration = ChronoUnit.MINUTES.between(
                    day.getStartedAt(),
                    day.getFinishedAt());
        }

        // Volumen total
        Double totalVolume = workoutSetService.getTotalVolumeByDay(userId, dayId);

        // Total de ejercicios
        int totalExercises = workoutSetService.getTotalExercisesByDay(userId, dayId);

        // Volumen por músculo
        var muscleVolumes = workoutSetService
                .getMuscleVolumeByDay(userId, dayId);

        return new WorkoutDaySummaryResponse(
                dayId,
                totalVolume,
                duration,
                totalExercises,
                muscleVolumes);
    }

    private ExerciseAlertResponse calculateExerciseAlert(
            LocalDate lastPerformedDate,
            Integer weeksRule) {
        if (weeksRule == null)
            weeksRule = 1;

        if (lastPerformedDate == null) {
            return new ExerciseAlertResponse(true, null, null);
        }

        long days = ChronoUnit.DAYS.between(lastPerformedDate, LocalDate.now());
        int weeksSince = (int) (days / 7);

        boolean overdue = weeksSince >= weeksRule;

        return new ExerciseAlertResponse(
                overdue,
                weeksSince,
                lastPerformedDate.toString());
    }

    private List<RuleAlertResponse> buildRuleAlerts(Long userId, List<Long> exerciseIds) {

        // Última fecha realizada por ejercicio
        Map<Long, LocalDate> lastDates = workoutExerciseRepository
                .findLastPerformedDatesByUser(userId)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> ((LocalDateTime) row[1]).toLocalDate()));

        List<RuleAlertResponse> result = new ArrayList<>();

        for (ExerciseReminderRule rule : exerciseReminderRuleRepository.findDistinctByExercises_IdIn(exerciseIds)) {

            // Fecha más reciente de cualquier ejercicio de la regla
            LocalDate lastPerformed = rule.getExercises()
                    .stream()
                    .map(ex -> lastDates.get(ex.getId()))
                    .filter(Objects::nonNull)
                    .max(LocalDate::compareTo)
                    .orElse(null);

            ExerciseAlertResponse alert = calculateExerciseAlert(lastPerformed, rule.getWeeks());

            if (alert.overdue()) {
                result.add(
                        new RuleAlertResponse(
                                rule.getId(),
                                rule.getName(),
                                rule.getExercises()
                                        .stream()
                                        .map(Exercise::getId)
                                        .toList(),
                                alert));
            }
        }

        return result;
    }

    private WorkoutExerciseResponse toWorkoutExerciseResponse(WorkoutExercise exercise, LocalDate lastPerformedDate) {
        Long dayId = exercise.getWorkoutDay() != null ? exercise.getWorkoutDay().getId() : null;
        Long exerciseId = exercise.getExercise() != null ? exercise.getExercise().getId() : null;
        String exerciseName = exercise.getExercise() != null ? exercise.getExercise().getName() : null;
        MuscleType exerciseMuscle = exercise.getExercise() != null ? exercise.getExercise().getMuscle() : null;
        String description = exercise.getExercise() != null ? exercise.getExercise().getDescription() : null;
        String image = exercise.getExercise() != null ? exercise.getExercise().getImage() : null;
        String video = exercise.getExercise() != null ? exercise.getExercise().getVideo() : null;
        String icon = exercise.getExercise() != null ? exercise.getExercise().getIcon() : null;

        boolean selected = dayId != null && exercise.getId() != null
                && selectedWorkoutExerciseService.isSelected(dayId, exercise.getId());
        ExerciseType type = exercise.getExercise() != null ? exercise.getExercise().getType() : null;
        return new WorkoutExerciseResponse(exercise.getId(), dayId, exerciseId, exerciseName, exerciseMuscle, type,
                exercise.getExerciseOrder(), exercise.getWeight(), description, exercise.getComment(),
                exercise.isCompleted(),
                exercise.getNextWeight(), image, video, icon, selected, lastPerformedDate);
    }

    private WorkoutDayResponse toResponse(WorkoutDay day) {
        Long workoutId = day.getWorkout() != null ? day.getWorkout().getId() : null;
        return new WorkoutDayResponse(day.getId(), day.getName(), muscleService.getMusclesFromWorkoutDay(day),
                day.getDayOrder(),
                day.getMuscleImage(), day.isAbdominal(), day.getStartedAt(), day.getFinishedAt(), day.getStatus(),
                workoutId);
    }
}
