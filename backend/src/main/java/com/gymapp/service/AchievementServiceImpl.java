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
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
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
    private UserAchievementService userAchievementService;

    private final Path imagePath = Paths.get("uploads/achievements");

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
    public AchievementResponse createAchievement(AchievementRequest request, MultipartFile image) throws IOException {

        Achievement achievement = new Achievement();

        achievement.setName(request.name());
        achievement.setType(request.type());
        achievement.setRequiredValue(request.requiredValue());
        achievement.setMuscle(request.muscle());

        if (request.levelId() != null) {
            UserLevel level = userLevelRepository.findById(request.levelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Nivel de usuario no encontrado"));
            achievement.setLevel(level);
        }

        if (request.exerciseId() != null) {
            Exercise exercise = exerciseRepository.findById(request.exerciseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ejercicio no encontrado"));
            achievement.setExercise(exercise);
        }

        Files.createDirectories(imagePath);

        if (image != null && !image.isEmpty()) {
            String extension = getExtension(image.getOriginalFilename());
            String safeName = request.name().toLowerCase().replace(" ", "_");
            String fileName = safeName + "." + extension;

            Files.copy(image.getInputStream(), imagePath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            achievement.setImage(fileName);
        }

        return toResponse(achievementRepository.save(achievement));
    }

    @Override
    public AchievementResponse updateAchievement(Long id,
            AchievementRequest request,
            MultipartFile image,
            Boolean deleteImage) throws IOException {

        Achievement achievement = achievementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logro no encontrado"));

        String oldName = achievement.getName();
        String newSafeName = request.name().toLowerCase().replace(" ", "_");

        achievement.setName(request.name());
        achievement.setType(request.type());
        achievement.setRequiredValue(request.requiredValue());
        achievement.setMuscle(request.muscle());

        Files.createDirectories(imagePath);

        // 🔥 eliminar imagen
        if (Boolean.TRUE.equals(deleteImage) && achievement.getImage() != null) {
            Files.deleteIfExists(imagePath.resolve(achievement.getImage()));
            achievement.setImage(null);
        }

        // 🔥 reemplazar imagen
        if (image != null && !image.isEmpty()) {

            if (achievement.getImage() != null) {
                Files.deleteIfExists(imagePath.resolve(achievement.getImage()));
            }

            String extension = getExtension(image.getOriginalFilename());
            String fileName = newSafeName + "." + extension;

            Files.copy(image.getInputStream(), imagePath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            achievement.setImage(fileName);
        }

        // 🔥 renombrar archivo si cambia nombre
        if (!oldName.equals(request.name()) && achievement.getImage() != null) {
            String oldSafeName = oldName.toLowerCase().replace(" ", "_");
            String ext = getExtension(achievement.getImage());

            Path oldFile = imagePath.resolve(oldSafeName + "." + ext);
            Path newFile = imagePath.resolve(newSafeName + "." + ext);

            if (Files.exists(oldFile)) {
                Files.move(oldFile, newFile, StandardCopyOption.REPLACE_EXISTING);
                achievement.setImage(newSafeName + "." + ext);
            }
        }

        // relaciones
        if (request.levelId() != null) {
            UserLevel level = userLevelRepository.findById(request.levelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Nivel de usuario no encontrado"));
            achievement.setLevel(level);
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
    public void deleteAchievement(Long id) throws IOException {

        Achievement achievement = achievementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logro no encontrado"));

        if (achievement.getImage() != null) {
            Files.deleteIfExists(imagePath.resolve(achievement.getImage()));
        }

        achievementRepository.deleteById(id);
    }

    @Override
    public ResponseEntity<Resource> getAchievementImage(String filename) throws IOException {

        Path filePath = imagePath.resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("Imagen no encontrada");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, Files.probeContentType(filePath))
                .body(resource);
    }

    private AchievementResponse toResponse(Achievement achievement) {
        return new AchievementResponse(
                achievement.getId(),
                achievement.getName(),
                achievement.getType(),
                achievement.getLevel() != null ? achievement.getLevel().getId() : null,
                achievement.getLevel() != null ? achievement.getLevel().getName() : null,
                achievement.getRequiredValue(),
                achievement.getImage(),
                achievement.getMuscle(),
                achievement.getExercise() != null ? achievement.getExercise().getId() : null,
                achievement.getExercise() != null ? achievement.getExercise().getName() : null);
    }

    private String getExtension(String fileName) {
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }
}