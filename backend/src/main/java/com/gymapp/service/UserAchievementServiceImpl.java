package com.gymapp.service;

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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private UserService userService;

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

    // Obtener todos los logros del usuario, ya sean bloqueados o desbloqueados
    @Override
    public List<UserAchievementResponse> getUserAchievements(Long userId) {

        // 🔹 1. Usuario
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Actualizar stats del usuario
        userService.updateUserStreakState(user);

        // Actualizar logros de streak
        updateStreakAchievements(user);

        // Crear nuevos logros si el usuario tiene progreso
        ensureAchievementsCreated(user);

        UserLevel userLevel = user.getUserLevel();

        // 🔹 2. Achievements disponibles (>= nivel del usuario)
        List<Achievement> achievements = achievementRepository
                .findByLevelIdGreaterThanEqual(userLevel.getId());

        // 🔹 3. Achievements desbloqueados o en progreso
        List<UserAchievement> unlockedList = userAchievementRepository.findByUserId(userId);

        Map<Long, UserAchievement> unlockedMap = unlockedList.stream()
                .collect(Collectors.toMap(
                        ua -> ua.getAchievement().getId(),
                        ua -> ua));

        // 🔹 4. Armar respuesta
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
                    achievement.getMuscle(),
                    achievement.getExercise() != null ? achievement.getExercise().getId() : null,
                    achievement.getExercise() != null ? achievement.getExercise().getName() : null,
                    achievement.getLevel().getId(),
                    achievement.getLevel().getName(),
                    unlocked,
                    unlockedAt,
                    progress);

        }).toList();
    }

    // Actualizar solo streak cuando se obtiene los logros
    private void updateStreakAchievements(User user) {

        // 🔹 1. Traer solo los UA activos (no completados)
        List<UserAchievement> existing = userAchievementRepository.findByUserId(user.getId());

        Map<Long, UserAchievement> uaMap = existing.stream()
                .collect(Collectors.toMap(
                        ua -> ua.getAchievement().getId(),
                        ua -> ua));

        // 🔹 2. Traer achievements STREAK disponibles
        List<Achievement> achievements = achievementRepository.findAvailableStreakAchievements(
                user.getUserLevel().getId());

        LocalDate today = LocalDate.now();

        double progress = 0.0;

        if (user.getStreakStartDate() != null) {
            progress = ChronoUnit.DAYS.between(
                    user.getStreakStartDate(),
                    today) + 1;
        }

        List<UserAchievement> toSave = new ArrayList<>();

        for (Achievement ach : achievements) {

            UserAchievement ua = uaMap.get(ach.getId());

            // 🔹 crear si no existe
            if (ua == null) {
                ua = new UserAchievement();
                ua.setUser(user);
                ua.setAchievement(ach);
                ua.setProgress(0.0);
            }

            boolean changed = false;

            // 🔹 actualizar progress SOLO si cambió
            if (!Objects.equals(ua.getProgress(), progress)) {
                ua.setProgress(progress);
                changed = true;
            }

            // 🔓 unlock
            if (ua.getUnlockedAt() == null &&
                    progress >= ach.getRequiredValue()) {

                ua.setUnlockedAt(LocalDateTime.now());
                changed = true;
            }

            if (changed) {
                toSave.add(ua);
            }
        }

        // 🔹 guardar solo si hay cambios reales
        if (!toSave.isEmpty()) {
            userAchievementRepository.saveAll(toSave);
        }
    }

    // Calcular el progreso de los logros que no esten creados
    private void ensureAchievementsCreated(User user) {

        List<Achievement> achievements = achievementRepository
                .findByLevelIdGreaterThanEqual(user.getUserLevel().getId());

        Map<Long, UserAchievement> existing = userAchievementRepository.findByUserId(user.getId())
                .stream()
                .collect(Collectors.toMap(
                        ua -> ua.getAchievement().getId(),
                        ua -> ua));

        // Traer todo con solo 3 query
        double totalVolume = workoutSetRepository.sumTotalVolumeAll(user.getId());

        Map<Long, Double> volumeByExercise = workoutSetRepository.sumVolumeGroupedByExercise(user.getId())
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Double) row[1]));

        Map<MuscleType, Double> volumeByMuscle = workoutSetRepository.sumVolumeGroupedByMuscle(user.getId())
                .stream()
                .collect(Collectors.toMap(
                        row -> (MuscleType) row[0],
                        row -> (Double) row[1]));

        List<UserAchievement> toSave = new ArrayList<>();

        for (Achievement ach : achievements) {

            if (existing.containsKey(ach.getId()))
                continue;

            double progress = 0;

            switch (ach.getType()) {

                case VOLUME -> {

                    if (ach.getExercise() != null) {
                        progress = volumeByExercise.getOrDefault(
                                ach.getExercise().getId(), 0.0);

                    } else if (ach.getMuscle() != null) {
                        progress = volumeByMuscle.getOrDefault(
                                ach.getMuscle(), 0.0);

                    } else {
                        progress = totalVolume;
                    }
                }

                case STREAK -> {
                    if (user.getStreakStartDate() != null) {
                        progress = ChronoUnit.DAYS.between(
                                user.getStreakStartDate(),
                                LocalDate.now()) + 1;
                    }
                }

                case CONSISTENCY -> {
                    progress = user.getTotalWorkoutDays();
                }
            }

            if (progress <= 0)
                continue; // 👈 clave

            UserAchievement ua = new UserAchievement();
            ua.setUser(user);
            ua.setAchievement(ach);
            ua.setProgress(progress);

            if (progress >= ach.getRequiredValue()) {
                ua.setUnlockedAt(LocalDateTime.now());
            }

            toSave.add(ua);
        }

        if (!toSave.isEmpty()) {
            userAchievementRepository.saveAll(toSave);
        }
    }

    @Override
    public void updateAchievements(User user, Long workoutDayId) {

        // 🔹 1. Traer sets del día
        List<WorkoutSet> sets = workoutSetRepository.findByWorkoutDayId(workoutDayId);

        if (sets.isEmpty())
            return;

        // 🔹 2. Agrupar volumen
        Map<Long, Double> volumeByExercise = new HashMap<>();
        Map<MuscleType, Double> volumeByMuscle = new HashMap<>();
        double totalVolume = 0;

        for (WorkoutSet set : sets) {

            double volume = set.getWeight() * set.getReps();

            Exercise ex = set.getWorkoutExercise().getExercise();
            MuscleType muscle = ex.getMuscle();

            totalVolume += volume;

            // volumen por ejercicio
            volumeByExercise.merge(ex.getId(), volume, Double::sum);

            // volumen por músculo
            if (muscle != null) {
                volumeByMuscle.merge(muscle, volume, Double::sum);
            }
        }

        // 🔹 3. Traer achievements del nivel hacia arriba
        List<Achievement> achievements = achievementRepository
                .findByLevelIdGreaterThanEqual(user.getUserLevel().getId());

        // 🔹 4. Filtrar SOLO los relevantes
        achievements = achievements.stream()
                .filter(ach -> {

                    // global
                    if (ach.getMuscle() == null && ach.getExercise() == null) {
                        return true;
                    }

                    // por músculo
                    if (ach.getMuscle() != null) {
                        return volumeByMuscle.containsKey(ach.getMuscle());
                    }

                    // por ejercicio
                    if (ach.getExercise() != null) {
                        return volumeByExercise.containsKey(ach.getExercise().getId());
                    }

                    return false;
                })
                .toList();

        // 🔹 5. UserAchievements existentes
        Map<Long, UserAchievement> uaMap = userAchievementRepository.findByUserId(user.getId())
                .stream()
                .collect(Collectors.toMap(
                        ua -> ua.getAchievement().getId(),
                        ua -> ua));

        List<UserAchievement> toSave = new ArrayList<>();

        // 🔹 6. Procesar logros
        for (Achievement ach : achievements) {

            UserAchievement ua = uaMap.get(ach.getId());

            // 🔹 crear si no existe
            if (ua == null) {
                ua = new UserAchievement();
                ua.setUser(user);
                ua.setAchievement(ach);
                ua.setProgress(calculateInitialProgress(user, ach, workoutDayId));
            }

            // 🔥 si ya está desbloqueado → NO tocar más
            if (ua.getUnlockedAt() != null) {
                continue;
            }

            double progressToAdd = 0;

            switch (ach.getType()) {

                case VOLUME -> {

                    if (ach.getExercise() != null) {
                        progressToAdd = volumeByExercise.getOrDefault(
                                ach.getExercise().getId(), 0.0);

                    } else if (ach.getMuscle() != null) {
                        progressToAdd = volumeByMuscle.getOrDefault(
                                ach.getMuscle(), 0.0);

                    } else {
                        progressToAdd = totalVolume;
                    }

                    ua.setProgress(ua.getProgress() + progressToAdd);
                }

                case STREAK -> {
                    if (user.getStreakStartDate() != null) {

                        long days = ChronoUnit.DAYS.between(
                                user.getStreakStartDate(),
                                LocalDate.now()) + 1;

                        ua.setProgress((double) days);

                    } else {
                        ua.setProgress(0.0);
                    }
                }

                case CONSISTENCY -> {
                    ua.setProgress((double) user.getTotalWorkoutDays());
                }
            }

            // 🔓 desbloqueo
            if (ua.getProgress() >= ach.getRequiredValue()) {
                ua.setUnlockedAt(LocalDateTime.now());
            }

            toSave.add(ua);
        }

        // 🔹 7. Guardar todo junto
        userAchievementRepository.saveAll(toSave);
    }

    // Calcular el progreso del usuario para los logros de volumen cuando se crea el
    // logro por primera vez
    private double calculateInitialProgress(User user, Achievement ach, Long workoutDayId) {

        switch (ach.getType()) {

            case VOLUME -> {

                if (ach.getExercise() != null) {
                    return workoutSetRepository.sumVolumeByExercise(
                            user.getId(),
                            ach.getExercise().getId(),
                            workoutDayId);

                } else if (ach.getMuscle() != null) {
                    return workoutSetRepository.sumVolumeByMuscle(
                            user.getId(),
                            ach.getMuscle(),
                            workoutDayId);

                } else {
                    return workoutSetRepository.sumTotalVolume(
                            user.getId(),
                            workoutDayId);
                }
            }

            case STREAK, CONSISTENCY -> {
                return 0.0; // 👈 clave
            }

            default -> {
                return 0.0;
            }
        }
    }

    // Recalcular el progreso de todos los logros de los usuario que esten asociados
    // a un logro que se modificó
    @Override
    public void refreshAchievementProgress(Achievement ach) {

        List<UserAchievement> userAchievements = userAchievementRepository.findByAchievementId(ach.getId());

        if (userAchievements.isEmpty())
            return;

        Map<Long, Double> progressByUser = new HashMap<>();

        // 🔹 1. Obtener progreso masivo SOLO para VOLUME
        if (ach.getType() == AchievementType.VOLUME) {

            List<Object[]> rows;

            if (ach.getExercise() != null) {
                rows = workoutSetRepository
                        .sumVolumeByExerciseGroupedByUser(ach.getExercise().getId());

            } else if (ach.getMuscle() != null) {
                rows = workoutSetRepository
                        .sumVolumeByMuscleGroupedByUser(ach.getMuscle());

            } else {
                rows = workoutSetRepository
                        .sumTotalVolumeByUser();
            }

            for (Object[] row : rows) {
                Long userId = (Long) row[0];
                Double volume = (Double) row[1];
                progressByUser.put(userId, volume);
            }
        }

        List<UserAchievement> toSave = new ArrayList<>();

        // 🔹 2. Recalcular por usuario
        for (UserAchievement ua : userAchievements) {

            User user = ua.getUser();

            double progress = calculateFullProgress(user, ach, progressByUser);

            boolean changed = false;

            // 🔄 actualizar progreso
            if (!Objects.equals(ua.getProgress(), progress)) {
                ua.setProgress(progress);
                changed = true;
            }

            // 🔓 / 🔒 estado de desbloqueo
            if (progress >= ach.getRequiredValue()) {
                if (ua.getUnlockedAt() == null) {
                    ua.setUnlockedAt(LocalDateTime.now());
                    changed = true;
                }
            } else {
                if (ua.getUnlockedAt() != null) {
                    ua.setUnlockedAt(null); // 👈 descompletar
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

            case VOLUME -> {

                // 🔥 lookup O(1)
                yield progressByUser.getOrDefault(user.getId(), 0.0);
            }

            case STREAK -> {

                if (user.getStreakStartDate() == null)
                    yield 0;

                yield ChronoUnit.DAYS.between(
                        user.getStreakStartDate(),
                        LocalDate.now()) + 1;
            }

            case CONSISTENCY -> {
                yield (double) user.getTotalWorkoutDays();
            }

            default -> 0;
        };
    }

    private UserAchievementResponse toResponse(UserAchievement userAchievement) {
        Achievement a = userAchievement.getAchievement();

        return new UserAchievementResponse(
                a.getId(),
                a.getName(),
                a.getType(),
                a.getRequiredValue(),
                a.getMuscle(),
                a.getExercise() != null ? a.getExercise().getId() : null,
                a.getExercise() != null ? a.getExercise().getName() : null,
                a.getLevel() != null ? a.getLevel().getId() : null,
                a.getLevel() != null ? a.getLevel().getName() : null,
                true, // 🔥 desbloqueado
                userAchievement.getUnlockedAt(),
                a.getRequiredValue() // 🔥 progreso completo
        );
    }
}
