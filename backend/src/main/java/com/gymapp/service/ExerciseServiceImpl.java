package com.gymapp.service;

import com.gymapp.dto.response.ExerciseResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.Exercise;
import com.gymapp.model.ExerciseType;
import com.gymapp.repository.ExerciseRepository;
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
public class ExerciseServiceImpl implements ExerciseService {

    @Autowired
    private ExerciseRepository exerciseRepository;

    private final Path imagePath = Paths.get("uploads/images");
    private final Path videoPath = Paths.get("uploads/videos");
    private final Path iconPath = Paths.get("uploads/icons");

    @Override
    public List<ExerciseResponse> getAllExercises() {
        return exerciseRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public ExerciseResponse getExerciseById(Long id) {
        return toResponse(exerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found")));
    }

    @Override
    public ExerciseResponse createExercise(String name, String description, ExerciseType type,
                                   String muscle,
                                   MultipartFile image, MultipartFile video, MultipartFile icon) throws IOException {
        Exercise exercise = new Exercise();
        exercise.setName(name);
        exercise.setDescription(description);
        exercise.setType(type);
        exercise.setMuscle(muscle);
        saveFiles(exercise, name, image, video, icon);
        return toResponse(exerciseRepository.save(exercise));
    }

    @Override
    public ExerciseResponse updateExercise(Long id, String name, String description, ExerciseType type,
                                   String muscle,
                                   MultipartFile image, MultipartFile video, MultipartFile icon,
                                   Boolean deleteImage, Boolean deleteVideo, Boolean deleteIcon) throws IOException {

        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ejercicio no encontrado"));

        String oldName = exercise.getName();
        String newSafeName = name.toLowerCase().replace(" ", "_");

        exercise.setName(name);
        exercise.setDescription(description);
        exercise.setType(type);
        exercise.setMuscle(muscle);

        Files.createDirectories(imagePath);
        Files.createDirectories(videoPath);
        Files.createDirectories(iconPath);

        if (Boolean.TRUE.equals(deleteImage) && exercise.getImage() != null) {
            Files.deleteIfExists(imagePath.resolve(exercise.getImage()));
            exercise.setImage(null);
        }

        if (Boolean.TRUE.equals(deleteVideo) && exercise.getVideo() != null) {
            Files.deleteIfExists(videoPath.resolve(exercise.getVideo()));
            exercise.setVideo(null);
        }

        if (Boolean.TRUE.equals(deleteIcon) && exercise.getIcon() != null) {
            Files.deleteIfExists(iconPath.resolve(exercise.getIcon()));
            exercise.setIcon(null);
        }

        if (image != null && !image.isEmpty()) {
            if (exercise.getImage() != null) {
                Files.deleteIfExists(imagePath.resolve(exercise.getImage()));
            }
            String extension = getExtension(image.getOriginalFilename());
            String fileName = newSafeName + "." + extension;
            Files.copy(image.getInputStream(), imagePath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            exercise.setImage(fileName);
        }

        if (video != null && !video.isEmpty()) {
            if (exercise.getVideo() != null) {
                Files.deleteIfExists(videoPath.resolve(exercise.getVideo()));
            }
            String extension = getExtension(video.getOriginalFilename());
            String fileName = newSafeName + "." + extension;
            Files.copy(video.getInputStream(), videoPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            exercise.setVideo(fileName);
        }

        if (icon != null && !icon.isEmpty()) {
            if (exercise.getIcon() != null) {
                Files.deleteIfExists(iconPath.resolve(exercise.getIcon()));
            }
            String extension = getExtension(icon.getOriginalFilename());
            String fileName = newSafeName + "." + extension;
            Files.copy(icon.getInputStream(), iconPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            exercise.setIcon(fileName);
        }

        if (!oldName.equals(name)) {
            String oldSafeName = oldName.toLowerCase().replace(" ", "_");
            if (exercise.getImage() != null) {
                String ext = getExtension(exercise.getImage());
                Path oldFile = imagePath.resolve(oldSafeName + "." + ext);
                Path newFile = imagePath.resolve(newSafeName + "." + ext);
                if (Files.exists(oldFile)) Files.move(oldFile, newFile, StandardCopyOption.REPLACE_EXISTING);
                exercise.setImage(newSafeName + "." + ext);
            }
            if (exercise.getVideo() != null) {
                String ext = getExtension(exercise.getVideo());
                Path oldFile = videoPath.resolve(oldSafeName + "." + ext);
                Path newFile = videoPath.resolve(newSafeName + "." + ext);
                if (Files.exists(oldFile)) Files.move(oldFile, newFile, StandardCopyOption.REPLACE_EXISTING);
                exercise.setVideo(newSafeName + "." + ext);
            }
            if (exercise.getIcon() != null) {
                String ext = getExtension(exercise.getIcon());
                Path oldFile = iconPath.resolve(oldSafeName + "." + ext);
                Path newFile = iconPath.resolve(newSafeName + "." + ext);
                if (Files.exists(oldFile)) Files.move(oldFile, newFile, StandardCopyOption.REPLACE_EXISTING);
                exercise.setIcon(newSafeName + "." + ext);
            }
        }

        return toResponse(exerciseRepository.save(exercise));
    }

    @Override
    public void deleteExercise(Long id) throws IOException {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
        if (exercise.getImage() != null) Files.deleteIfExists(imagePath.resolve(exercise.getImage()));
        if (exercise.getVideo() != null) Files.deleteIfExists(videoPath.resolve(exercise.getVideo()));
        if (exercise.getIcon() != null) Files.deleteIfExists(iconPath.resolve(exercise.getIcon()));
        exerciseRepository.deleteById(id);
    }

    @Override
    public ResponseEntity<Resource> getExerciseImage(String filename) throws IOException {
        Path filePath = imagePath.resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists()) throw new RuntimeException("Imagen no encontrada");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, Files.probeContentType(filePath))
                .body(resource);
    }

    @Override
    public ResponseEntity<Resource> getExerciseVideo(String filename) throws IOException {
        Path filePath = videoPath.resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists()) throw new RuntimeException("Video no encontrado");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, Files.probeContentType(filePath))
                .body(resource);
    }

    @Override
    public ResponseEntity<Resource> getExerciseIcon(String filename) throws IOException {
        Path filePath = iconPath.resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists()) throw new RuntimeException("Icono no encontrado");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, Files.probeContentType(filePath))
                .body(resource);
    }

    private void saveFiles(Exercise exercise, String name, MultipartFile image, MultipartFile video, MultipartFile icon) throws IOException {
        String safeName = name.toLowerCase().replace(" ", "_");
        Files.createDirectories(imagePath);
        Files.createDirectories(videoPath);
        Files.createDirectories(iconPath);
        if (image != null && !image.isEmpty()) {
            String extension = getExtension(image.getOriginalFilename());
            String fileName = safeName + "." + extension;
            Files.copy(image.getInputStream(), imagePath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            exercise.setImage(fileName);
        }
        if (video != null && !video.isEmpty()) {
            String extension = getExtension(video.getOriginalFilename());
            String fileName = safeName + "." + extension;
            Files.copy(video.getInputStream(), videoPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            exercise.setVideo(fileName);
        }
        if (icon != null && !icon.isEmpty()) {
            String extension = getExtension(icon.getOriginalFilename());
            String fileName = safeName + "." + extension;
            Files.copy(icon.getInputStream(), iconPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            exercise.setIcon(fileName);
        }
    }

    private String getExtension(String fileName) {
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }

    private ExerciseResponse toResponse(Exercise e) {
        return new ExerciseResponse(e.getId(), e.getName(), e.getDescription(), e.getType(), e.getMuscle(), e.getImage(), e.getVideo(), e.getIcon());
    }
}
