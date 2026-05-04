package com.gymapp.service;

import com.gymapp.dto.request.AchievementRequest;
import com.gymapp.dto.response.AchievementResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.Achievement;
import com.gymapp.model.Exercise;
import com.gymapp.model.UserLevel;
import com.gymapp.repository.AchievementRepository;
import com.gymapp.repository.ExerciseRepository;
import com.gymapp.repository.UserLevelRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AchievementServiceImpl implements AchievementService {

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private UserLevelRepository userLevelRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private UserAchievementService userAchievementService;;

    @Override
    public List<AchievementResponse> getAllAchievements() {
        return achievementRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AchievementResponse getAchievementById(Long id) {
        return toResponse(
                achievementRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Logro no encontrado")));
    }

    @Override
    public AchievementResponse createAchievement(AchievementRequest request) {
        Achievement achievement = new Achievement();
        achievement.setName(request.name());
        achievement.setType(request.type());
        achievement.setRequiredValue(request.requiredValue());
        achievement.setMuscle(request.muscle());

        if (request.levelId() != null) {
            UserLevel minLevel = userLevelRepository.findById(request.levelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Nivel de usuario no encontrado"));
            achievement.setLevel(minLevel);
        }

        if (request.exerciseId() != null) {
            Exercise exercise = exerciseRepository.findById(request.exerciseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ejercicio no encontrado"));
            achievement.setExercise(exercise);
        }

        return toResponse(achievementRepository.save(achievement));
    }

    @Override
    public AchievementResponse updateAchievement(Long id, AchievementRequest request) {
        Achievement achievement = achievementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logro no encontrado"));

        achievement.setName(request.name());
        achievement.setType(request.type());
        achievement.setRequiredValue(request.requiredValue());
        achievement.setMuscle(request.muscle());

        if (request.levelId() != null) {
            UserLevel minLevel = userLevelRepository.findById(request.levelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Nivel de usuario no encontrado"));
            achievement.setLevel(minLevel);
        } else {
            achievement.setLevel(null);
        }

        if (request.exerciseId() != null) {
            Exercise exercise = exerciseRepository.findById(request.exerciseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ejercicio no encontrado"));
            achievement.setExercise(exercise);
        } else {
            achievement.setExercise(null);
        }

        achievementRepository.save(achievement);

        userAchievementService.refreshAchievementProgress(achievement);

        return toResponse(achievement);
    }

    @Override
    public void deleteAchievement(Long id) {
        if (!achievementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Logro no encontrado");
        }
        achievementRepository.deleteById(id);
    }

    private AchievementResponse toResponse(Achievement achievement) {
        return new AchievementResponse(
                achievement.getId(),
                achievement.getName(),
                achievement.getType(),
                achievement.getLevel() != null ? achievement.getLevel().getId() : null,
                achievement.getLevel() != null ? achievement.getLevel().getName() : null,
                achievement.getRequiredValue(),
                achievement.getMuscle(),
                achievement.getExercise() != null ? achievement.getExercise().getId() : null,
                achievement.getExercise() != null ? achievement.getExercise().getName() : null);
    }
}