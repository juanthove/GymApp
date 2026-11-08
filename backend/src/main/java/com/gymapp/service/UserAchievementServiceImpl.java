package com.gymapp.service;

import com.gymapp.dto.response.AchievementExerciseResponse;
import com.gymapp.dto.response.UserAchievementResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.Achievement;
import com.gymapp.model.AchievementType;
import com.gymapp.model.Exercise;
import com.gymapp.model.MuscleType;
import com.gymapp.model.User;
import com.gymapp.model.UserAchievement;
import com.gymapp.model.UserLevel;
import com.gymapp.model.WorkoutSet;
import com.gymapp.repository.AchievementRepository;
import com.gymapp.repository.UserAchievementRepository;
import com.gymapp.repository.UserRepository;
import com.gymapp.repository.WorkoutSetRepository;
import com.gymapp.repository.projection.WorkoutDateProjection;
import com.gymapp.repository.WorkoutDayRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.time.YearMonth;
import java.time.temporal.WeekFields;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class UserAchievementServiceImpl implements UserAchievementService {

    @Autowired
    private UserAchievementRepository userAchievementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private WorkoutSetRepository workoutSetRepository;

    @Autowired
    private WorkoutDayRepository workoutDayRepository;

    @Autowired
    private UserStatsService userStatsService;

    private record DateRange(
            LocalDate start,
            LocalDate end) {
    }

    @Override
    public List<UserAchievementResponse> getAllUserAchievements() {
        return userAchievementRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public UserAchievementResponse getUserAchievementById(Long id) {
        return toResponse(userAchievementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UserAchievement no encontrado")));
    }

    @Override
    public UserAchievementResponse createUserAchievement(Long userId, Long achievementId,
            LocalDateTime unlockedAt) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Achievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResourceNotFoundException("Logro no encontrado"));

        UserAchievement userAchievement = new UserAchievement();
        userAchievement.setUser(user);
        userAchievement.setAchievement(achievement);
        userAchievement.setUnlockedAt(unlockedAt != null ? unlockedAt : LocalDateTime.now());

        return toResponse(userAchievementRepository.save(userAchievement));
    }

    @Override
    public UserAchievementResponse updateUserAchievement(Long id, Long userId, Long achievementId,
            LocalDateTime unlockedAt) {
        UserAchievement userAchievement = userAchievementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UserAchievement no encontrado"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Achievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResourceNotFoundException("Logro no encontrado"));

        userAchievement.setUser(user);
        userAchievement.setAchievement(achievement);
        userAchievement.setUnlockedAt(unlockedAt != null ? unlockedAt : userAchievement.getUnlockedAt());

        return toResponse(userAchievementRepository.save(userAchievement));
    }

    @Override
    public void deleteUserAchievement(Long id) {
        if (!userAchievementRepository.existsById(id)) {
            throw new ResourceNotFoundException("UserAchievement no encontrado");
        }
        userAchievementRepository.deleteById(id);
    }

    private AchievementExerciseResponse toExerciseResponse(Exercise exercise) {
        return new AchievementExerciseResponse(
                exercise.getId(),
                exercise.getName(),
                exercise.getMuscle(),
                exercise.getType(),
                exercise.getIcon());
    }

    // Obtener todos los logros del usuario, ya sean bloqueados o desbloqueados
    @Override
    public List<UserAchievementResponse> getUserAchievements(Long userId) {

        // Usuario
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Actualizar stats del usuario
        userStatsService.updateUserStreakState(user);

        // Actualizar logros de streak
        updateStreakAchievements(user);

        // Crear nuevos logros si el usuario tiene progreso
        // ensureAchievementsCreated(user);

        UserLevel userLevel = user.getUserLevel();

        // Achievements disponibles (>= nivel del usuario)
        List<Achievement> achievements = achievementRepository
                .findByLevelIdGreaterThanEqual(userLevel.getId());

        // Achievements desbloqueados o en progreso
        List<UserAchievement> unlockedList = userAchievementRepository.findByUserId(userId);

        Map<Long, UserAchievement> unlockedMap = unlockedList.stream()
                .collect(Collectors.toMap(
                        ua -> ua.getAchievement().getId(),
                        ua -> ua));

        // Armar respuesta
        return achievements.stream().map(achievement -> {

            UserAchievement ua = unlockedMap.get(achievement.getId());

            boolean unlocked = ua != null && ua.getUnlockedAt() != null;

            Double progress = ua != null ? ua.getProgress() : 0.0;

            LocalDateTime unlockedAt = ua != null ? ua.getUnlockedAt() : null;

            return new UserAchievementResponse(
                    achievement.getId(),
                    achievement.getName(),
                    achievement.getType(),
                    achievement.getRequiredValue(),
                    achievement.getImage(),
                    achievement.getMinimumDate(),
                    achievement.getTimeLimit(),
                    achievement.getTimeLimitType(),
                    achievement.getMuscle(),
                    achievement.getExercises().stream()
                            .map(this::toExerciseResponse)
                            .toList(),
                    achievement.getLevel().getId(),
                    achievement.getLevel().getName(),
                    unlocked,
                    unlockedAt,
                    progress);

        }).toList();
    }

    // -----------------------------
    // CALCULO DE PROGRESO DE LOGROS
    // -----------------------------

    // Obtener rango de ferchas para calcular el progreso de un logro

    private DateRange getAchievementDateRange(Achievement achievement) {
        LocalDate today = LocalDate.now();
        LocalDate minimumDate = achievement.getMinimumDate();

        // Sin timeLimit
        if (achievement.getTimeLimit() == null) {
            if (minimumDate == null) {
                // Todo el historial
                return new DateRange(null, today);
            }

            // Desde minimumDate exacta hasta hoy
            return new DateRange(minimumDate, today);
        }

        LocalDate startByTimeLimit;

        // Calcular el inicio según el límite temporal
        switch (achievement.getTimeLimitType()) {
            case WEEK ->
                startByTimeLimit = today
                        .with(DayOfWeek.MONDAY)
                        .minusWeeks(achievement.getTimeLimit() - 1L);

            case MONTH ->
                startByTimeLimit = today
                        .withDayOfMonth(1)
                        .minusMonths(achievement.getTimeLimit() - 1L);

            case YEAR ->
                startByTimeLimit = today
                        .withDayOfYear(1)
                        .minusYears(achievement.getTimeLimit() - 1L);

            default ->
                throw new IllegalStateException(
                        "Tipo de límite de tiempo no válido");
        }

        // Si hay minimumDate, redondearla al inicio de su período
        if (minimumDate != null) {
            LocalDate startByMinimumDate;

            switch (achievement.getTimeLimitType()) {
                case WEEK ->
                    startByMinimumDate = minimumDate.with(DayOfWeek.MONDAY);

                case MONTH ->
                    startByMinimumDate = minimumDate.withDayOfMonth(1);

                case YEAR ->
                    startByMinimumDate = minimumDate.withDayOfYear(1);

                default ->
                    throw new IllegalStateException(
                            "Tipo de límite de tiempo no válido");
            }

            // Elegir el inicio más reciente
            if (startByMinimumDate.isAfter(startByTimeLimit)) {
                startByTimeLimit = startByMinimumDate;
            }
        }

        return new DateRange(startByTimeLimit, today);
    }

    // Calcular el progreso para el volumen
    private void calculateVolumeProgress(
            User user,
            Achievement ach,
            UserAchievement ua,
            double currentWorkoutVolume) {

        LocalDate today = LocalDate.now();

        // Si el entrenamiento no corresponde a la fecha mínima, no sumar.
        if (ach.getMinimumDate() != null &&
                today.isBefore(ach.getMinimumDate())) {
            return;
        }

        // Si no tiene límite temporal, sumar directamente.
        if (ach.getTimeLimit() == null) {
            ua.setProgress(ua.getProgress() + currentWorkoutVolume);
            return;
        }

        boolean recalculate = hasPeriodChanged(ua, ach);

        if (recalculate) {
            double fullProgress = calculateFullVolumeProgress(user, ach);

            ua.setProgress(fullProgress);
            ua.setProgressUpdatedAt(LocalDateTime.now());

        } else {
            ua.setProgress(ua.getProgress() + currentWorkoutVolume);
            ua.setProgressUpdatedAt(LocalDateTime.now());
        }
    }

    // Calcular el progreso para la consistencia
    private long calculateConsistencyProgress(
            User user,
            Achievement achievement) {

        if (achievement.getMinimumDate() == null && achievement.getTimeLimit() == null) {
            return user.getTotalWorkoutDays();
        }

        DateRange range = getAchievementDateRange(achievement);

        List<LocalDate> workoutDates = workoutDayRepository
                .findWorkoutDatesByUserAndDateRange(
                        user.getId(),
                        range.start(),
                        range.end())
                .stream()
                .map(WorkoutDateProjection::getDate)
                .toList();

        return workoutDates.size();
    }

    // Calcular el progreso para la racha, no se utiliza el limite de tiempo porque
    // una racha no puede tener limite de tiempo
    private long calculateStreakProgress(
            User user,
            Achievement achievement) {
        LocalDate today = LocalDate.now();

        // Si no tiene fecha minima usa directamente la racha actual del usuario
        if (achievement.getMinimumDate() == null) {

            LocalDate streakStart = user.getStreakStartDate();

            if (streakStart == null || streakStart.isAfter(today)) {
                return 0;
            }

            return ChronoUnit.DAYS.between(streakStart, today) + 1;
        }

        LocalDate startDate = achievement.getMinimumDate();

        // El usuario actualmente no tiene una racha.
        if (startDate == null) {
            return 0;
        }

        // Si por alguna razón la fecha inicial es posterior a hoy.
        if (startDate.isAfter(today)) {
            return 0;
        }

        int requiredDaysPerWeek = user.getGymDaysPerWeek();

        if (requiredDaysPerWeek <= 0) {
            return 0;
        }

        List<LocalDate> workoutDates = workoutDayRepository
                .findWorkoutDatesByUserAndDateRange(
                        user.getId(),
                        startDate,
                        today)
                .stream()
                .map(WorkoutDateProjection::getDate)
                .toList();

        if (workoutDates.isEmpty()) {
            return 0;
        }

        // Agrupamos los entrenamientos por semana ISO.
        WeekFields weekFields = WeekFields.ISO;

        Map<String, Long> workoutsByWeek = workoutDates.stream()
                .distinct()
                .collect(Collectors.groupingBy(date -> {
                    int year = date.get(weekFields.weekBasedYear());
                    int week = date.get(weekFields.weekOfWeekBasedYear());

                    return year + "-" + week;
                }, Collectors.counting()));

        LocalDate currentWeekStart = today.with(DayOfWeek.MONDAY);

        LocalDate firstWeekStart = startDate.with(DayOfWeek.MONDAY);

        long progress = 0;

        while (!currentWeekStart.isBefore(firstWeekStart)) {

            int year = currentWeekStart.get(
                    weekFields.weekBasedYear());

            int week = currentWeekStart.get(
                    weekFields.weekOfWeekBasedYear());

            String key = year + "-" + week;

            long daysTrained = workoutsByWeek.getOrDefault(key, 0L);

            if (currentWeekStart.equals(today.with(DayOfWeek.MONDAY))) {

                long daysUntilToday = ChronoUnit.DAYS.between(
                        currentWeekStart,
                        today) + 1;

                progress += daysUntilToday;

                currentWeekStart = currentWeekStart.minusWeeks(1);
                continue;
            }

            if (daysTrained < requiredDaysPerWeek) {
                break;
            }

            progress += 7;

            currentWeekStart = currentWeekStart.minusWeeks(1);
        }

        return progress;
    }

    // Actualizar solo streak cuando se obtiene los logros
    private void updateStreakAchievements(User user) {

        // Traer los UserAchievement existentes
        List<UserAchievement> existing = userAchievementRepository.findByUserId(user.getId());

        Map<Long, UserAchievement> uaMap = existing.stream()
                .collect(Collectors.toMap(
                        ua -> ua.getAchievement().getId(),
                        ua -> ua));

        // Traer achievements STREAK disponibles
        List<Achievement> achievements = achievementRepository.findAvailableStreakAchievements(
                user.getUserLevel().getId());

        List<UserAchievement> toSave = new ArrayList<>();

        for (Achievement ach : achievements) {

            UserAchievement ua = uaMap.get(ach.getId());

            if (ua == null) {
                ua = new UserAchievement();
                ua.setUser(user);
                ua.setAchievement(ach);
                ua.setProgress(0.0);
                ua.setProgressUpdatedAt(LocalDateTime.now());
            }

            // Cada achievement calcula su propia racha
            double progress = calculateStreakProgress(user, ach);

            if (!Objects.equals(ua.getProgress(), progress)) {
                ua.setProgress(progress);
            }

            if (ua.getUnlockedAt() == null &&
                    progress >= ach.getRequiredValue()) {

                ua.setUnlockedAt(LocalDateTime.now());
            }

            toSave.add(ua);
        }

        if (!toSave.isEmpty()) {
            userAchievementRepository.saveAll(toSave);
        }
    }

    // Actualizar los logros de un usuario utilizando los datos de un entrenamiento
    @Override
    public void updateAchievements(User user, Long workoutDayId) {

        // Traer sets del día
        List<WorkoutSet> sets = workoutSetRepository.findByWorkoutDayId(workoutDayId);

        if (sets.isEmpty())
            return;

        // Agrupar volumen
        Map<Long, Double> volumeByExercise = new HashMap<>();
        Map<MuscleType, Double> volumeByMuscle = new HashMap<>();
        double totalVolume = 0;

        for (WorkoutSet set : sets) {

            double volume = set.getWeight() * set.getReps();

            Exercise ex = set.getWorkoutExercise().getExercise();
            MuscleType muscle = ex.getMuscle();

            totalVolume += volume;

            // Volumen por ejercicio
            volumeByExercise.merge(ex.getId(), volume, Double::sum);

            // Volumen por músculo
            if (muscle != null) {
                volumeByMuscle.merge(muscle, volume, Double::sum);
            }
        }

        // Traer achievements del nivel hacia arriba
        List<Achievement> achievements = achievementRepository
                .findByLevelIdGreaterThanEqual(user.getUserLevel().getId());

        // Filtrar SOLO los relevantes
        achievements = achievements.stream()
                .filter(ach -> {

                    // Global
                    if (ach.getMuscle() == null && ach.getExercises().isEmpty()) {
                        return true;
                    }

                    // Por músculo
                    if (ach.getMuscle() != null) {
                        return volumeByMuscle.containsKey(ach.getMuscle());
                    }

                    // Por ejercicio
                    if (!ach.getExercises().isEmpty()) {
                        return ach.getExercises().stream()
                                .anyMatch(ex -> volumeByExercise.containsKey(ex.getId()));
                    }

                    return false;
                })
                .toList();

        // UserAchievements existentes
        Map<Long, UserAchievement> uaMap = userAchievementRepository.findByUserId(user.getId())
                .stream()
                .collect(Collectors.toMap(
                        ua -> ua.getAchievement().getId(),
                        ua -> ua));

        List<UserAchievement> toSave = new ArrayList<>();

        // Procesar logros
        for (Achievement ach : achievements) {

            UserAchievement ua = uaMap.get(ach.getId());

            // Crear si no existe
            if (ua == null) {
                ua = new UserAchievement();
                ua.setUser(user);
                ua.setAchievement(ach);
                ua.setProgress(calculateInitialProgress(user, ach, workoutDayId));
                ua.setProgressUpdatedAt(LocalDateTime.now());
            }

            if (ua.getUnlockedAt() != null) {
                continue;
            }

            double progressToAdd = 0;

            switch (ach.getType()) {

                case VOLUME -> {

                    if (!ach.getExercises().isEmpty()) {

                        progressToAdd = ach.getExercises().stream()
                                .mapToDouble(ex -> volumeByExercise.getOrDefault(ex.getId(), 0.0))
                                .sum();

                    } else if (ach.getMuscle() != null) {
                        progressToAdd = volumeByMuscle.getOrDefault(
                                ach.getMuscle(), 0.0);

                    } else {
                        progressToAdd = totalVolume;
                    }

                    calculateVolumeProgress(user, ach, ua, progressToAdd);
                }

                case STREAK -> {
                    ua.setProgress(
                            (double) calculateStreakProgress(user, ach));
                }

                case CONSISTENCY -> {
                    ua.setProgress(
                            (double) calculateConsistencyProgress(user, ach));
                }
            }

            // Desbloqueo
            if (ua.getProgress() >= ach.getRequiredValue()) {
                ua.setUnlockedAt(LocalDateTime.now());
            }

            toSave.add(ua);
        }

        // Guardar todo junto
        userAchievementRepository.saveAll(toSave);
    }

    // Calcular el progreso del usuario para los logros de volumen cuando se crea el
    // logro por primera vez
    private double calculateInitialProgress(User user, Achievement ach, Long workoutDayId) {

        switch (ach.getType()) {

            case VOLUME -> {
                return calculateFullVolumeProgress(user, ach);
            }

            case STREAK, CONSISTENCY -> {
                return 0.0;
            }

            default -> {
                return 0.0;
            }
        }
    }

    // Recalcular el progreso de todos los logros de los usuario que esten asociados
    // a un logro que se modificó
    @Override
    public void syncAchievementProgress(Achievement ach) {

        List<User> users = userRepository.findAll();

        // Traer los UserAchievement existentes de este logro
        Map<Long, UserAchievement> existingByUser = userAchievementRepository
                .findByAchievementId(ach.getId())
                .stream()
                .collect(Collectors.toMap(
                        ua -> ua.getUser().getId(),
                        ua -> ua));

        Map<Long, Double> progressByUser = new HashMap<>();

        // Obtener el progreso de los logros de volumen para todos los usuarios
        if (ach.getType() == AchievementType.VOLUME) {

            DateRange range = getAchievementDateRange(ach);

            LocalDateTime from = range.start() != null
                    ? range.start().atStartOfDay()
                    : null;

            LocalDateTime to = range.end() != null
                    ? range.end().plusDays(1).atStartOfDay()
                    : null;

            List<Object[]> rows;

            if (!ach.getExercises().isEmpty()) {

                List<Long> exerciseIds = ach.getExercises().stream()
                        .map(Exercise::getId)
                        .toList();

                rows = workoutSetRepository
                        .sumVolumeByExercisesAndDateRangeGrouped(
                                exerciseIds, from, to);

            } else if (ach.getMuscle() != null) {

                rows = workoutSetRepository
                        .sumVolumeByMuscleAndDateRangeGrouped(
                                ach.getMuscle().name(), from, to);

            } else {

                rows = workoutSetRepository
                        .sumTotalVolumeByUserAndDateRangeGrouped(
                                from, to);
            }

            for (Object[] row : rows) {
                progressByUser.put(
                        ((Number) row[0]).longValue(),
                        ((Number) row[1]).doubleValue());
            }
        }

        List<UserAchievement> toSave = new ArrayList<>();

        for (User user : users) {

            double progress = calculateFullProgress(user, ach, progressByUser);

            UserAchievement ua = existingByUser.get(user.getId());

            // Si no existe y no tiene progreso, no crear nada
            if (ua == null && progress <= 0) {
                continue;
            }

            boolean changed = false;

            // Crear si no existe
            if (ua == null) {
                ua = new UserAchievement();
                ua.setUser(user);
                ua.setAchievement(ach);
                changed = true;
                ua.setProgressUpdatedAt(LocalDateTime.now());
            }

            // Actualizar progreso
            if (!Objects.equals(ua.getProgress(), progress)) {
                ua.setProgress(progress);
                ua.setProgressUpdatedAt(LocalDateTime.now());
                changed = true;
            }

            // Actualizar estado de desbloqueo
            if (progress >= ach.getRequiredValue()) {

                if (ua.getUnlockedAt() == null) {
                    ua.setUnlockedAt(LocalDateTime.now());
                    changed = true;
                }

            } else {

                if (ua.getUnlockedAt() != null) {
                    ua.setUnlockedAt(null);
                    changed = true;
                }
            }

            if (changed) {
                toSave.add(ua);
            }
        }

        if (!toSave.isEmpty()) {
            userAchievementRepository.saveAll(toSave);
        }
    }

    // Calcular el progreso de un logro para un usuario
    private double calculateFullProgress(
            User user,
            Achievement ach,
            Map<Long, Double> progressByUser) {

        return switch (ach.getType()) {

            case VOLUME ->
                progressByUser.getOrDefault(
                        user.getId(),
                        0.0);

            case STREAK ->
                calculateStreakProgress(
                        user,
                        ach);

            case CONSISTENCY ->
                calculateConsistencyProgress(
                        user,
                        ach);

            default -> 0;
        };
    }

    // Calcular el progreso completo de un logro de volumen para un usuario para
    // logros con tiempo limite
    private double calculateFullVolumeProgress(
            User user,
            Achievement ach) {

        if (ach.getMinimumDate() != null &&
            ach.getMinimumDate().isAfter(LocalDate.now())) {
                return 0.0;
            }

        DateRange range = getAchievementDateRange(ach);

        LocalDateTime from = range.start() != null
                ? range.start().atStartOfDay()
                : null;

        LocalDateTime to = range.end() != null
                ? range.end().plusDays(1).atStartOfDay()
                : null;

        if (!ach.getExercises().isEmpty()) {

            List<Long> exerciseIds = ach.getExercises().stream()
                    .map(Exercise::getId)
                    .toList();

            return workoutSetRepository.sumVolumeByExercisesAndDateRange(
                    user.getId(),
                    exerciseIds,
                    from,
                    to);

        } else if (ach.getMuscle() != null) {

            return workoutSetRepository.sumVolumeByMuscleAndDateRange(
                    user.getId(),
                    ach.getMuscle().name(),
                    from,
                    to);

        } else {

            return workoutSetRepository.sumTotalVolumeByUserAndDateRange(
                    user.getId(),
                    from,
                    to);
        }
    }

    //Recalcular el progreso de los logros de un usuario cuando cambia la unidad de tiempo del limite de tiempo al iniciar sesión
    @Async
    @Transactional
    public void updateOutdatedAchievements(User user) {

        List<UserAchievement> userAchievements =
                userAchievementRepository.findByUserId(user.getId());

        List<UserAchievement> toSave = new ArrayList<>();

        for (UserAchievement ua : userAchievements) {

            // Si el logro ya está desbloqueado, no modificarlo.
            if (ua.getUnlockedAt() != null) {
                continue;
            }

            Achievement achievement = ua.getAchievement();

            if (achievement.getTimeLimit() == null) {
                continue;
            }

            if (hasPeriodChanged(ua, achievement)) {

                double progress = calculateFullProgress(user, achievement);

                ua.setProgress(progress);
                ua.setProgressUpdatedAt(LocalDateTime.now());

                //Desbloqueo
                if (progress >= achievement.getRequiredValue()) {
                    ua.setUnlockedAt(LocalDateTime.now());
                }

                toSave.add(ua);
            }
        }

        if (!toSave.isEmpty()) {
            userAchievementRepository.saveAll(toSave);
        }
    }

    private boolean hasPeriodChanged(UserAchievement ua, Achievement achievement) {

        LocalDateTime lastUpdate = ua.getProgressUpdatedAt();

        // Si nunca se actualizó, necesita recalcularse.
        if (lastUpdate == null) {
            return true;
        }

        LocalDate today = LocalDate.now();
        LocalDate lastUpdateDate = lastUpdate.toLocalDate();

        switch (achievement.getTimeLimitType()) {

            case WEEK -> {
                WeekFields weekFields = WeekFields.ISO;

                int currentWeek = today.get(weekFields.weekOfWeekBasedYear());
                int currentWeekYear = today.get(weekFields.weekBasedYear());

                int lastWeek = lastUpdateDate.get(weekFields.weekOfWeekBasedYear());
                int lastWeekYear = lastUpdateDate.get(weekFields.weekBasedYear());

                return currentWeek != lastWeek || currentWeekYear != lastWeekYear;
            }

            case MONTH -> {
                return !YearMonth.from(today).equals(YearMonth.from(lastUpdateDate));
            }

            case YEAR -> {
                return today.getYear() != lastUpdateDate.getYear();
            }

            default -> throw new IllegalStateException(
                    "Tipo de límite de tiempo no válido");
        }
    }

    private double calculateFullProgress(User user, Achievement ach) {

        return switch (ach.getType()) {

            case VOLUME ->
                calculateFullVolumeProgress(user, ach);

            case STREAK ->
                calculateStreakProgress(user, ach);

            case CONSISTENCY ->
                calculateConsistencyProgress(user, ach);

            default -> 0.0;
        };
    }

    private UserAchievementResponse toResponse(UserAchievement userAchievement) {
        Achievement a = userAchievement.getAchievement();

        return new UserAchievementResponse(
                a.getId(),
                a.getName(),
                a.getType(),
                a.getRequiredValue(),
                a.getImage(),
                a.getMinimumDate(),
                a.getTimeLimit(),
                a.getTimeLimitType(),
                a.getMuscle(),
                a.getExercises().stream()
                        .map(this::toExerciseResponse)
                        .toList(),
                a.getLevel() != null ? a.getLevel().getId() : null,
                a.getLevel() != null ? a.getLevel().getName() : null,
                true,
                userAchievement.getUnlockedAt(),
                a.getRequiredValue() // Progreso completo
        );
    }
}
