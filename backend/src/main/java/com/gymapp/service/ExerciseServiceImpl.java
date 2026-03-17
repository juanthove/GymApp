package com.gymapp.service;

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

    @Override
    public List<Exercise> getAllExercises() {
        return exerciseRepository.findAll();
    }

    @Override
    public Exercise getExerciseById(Long id) {
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
    }

    @Override
    public Exercise createExercise(String name, String description, ExerciseType type,
                                   MultipartFile image, MultipartFile video) throws IOException {
        Exercise exercise = new Exercise();
        exercise.setName(name);
        exercise.setDescription(description);
        exercise.setType(type);
        saveFiles(exercise, name, image, video);
        return exerciseRepository.save(exercise);
    }

    @Override
    public Exercise updateExercise(Long id, String name, String description, ExerciseType type,
                                   MultipartFile image, MultipartFile video,
                                   Boolean deleteImage, Boolean deleteVideo) throws IOException {

        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        String oldName = exercise.getName();
        String newSafeName = name.toLowerCase().replace(" ", "_");

        exercise.setName(name);
        exercise.setDescription(description);
        exercise.setType(type);

        Files.createDirectories(imagePath);
        Files.createDirectories(videoPath);

        if (Boolean.TRUE.equals(deleteImage) && exercise.getImage() != null) {
            Files.deleteIfExists(imagePath.resolve(exercise.getImage()));
            exercise.setImage(null);
        }

        if (Boolean.TRUE.equals(deleteVideo) && exercise.getVideo() != null) {
            Files.deleteIfExists(videoPath.resolve(exercise.getVideo()));
            exercise.setVideo(null);
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
        }

        return exerciseRepository.save(exercise);
    }

    @Override
    public void deleteExercise(Long id) throws IOException {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
        if (exercise.getImage() != null) Files.deleteIfExists(imagePath.resolve(exercise.getImage()));
        if (exercise.getVideo() != null) Files.deleteIfExists(videoPath.resolve(exercise.getVideo()));
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

    private void saveFiles(Exercise exercise, String name, MultipartFile image, MultipartFile video) throws IOException {
        String safeName = name.toLowerCase().replace(" ", "_");
        Files.createDirectories(imagePath);
        Files.createDirectories(videoPath);
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
    }

    private String getExtension(String fileName) {
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }
}
