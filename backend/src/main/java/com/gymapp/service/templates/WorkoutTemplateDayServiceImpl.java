package com.gymapp.service.templates;

import com.gymapp.dto.response.templates.WorkoutTemplateDayResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.templates.WorkoutTemplateDay;
import com.gymapp.repository.WorkoutDayRepository;
import com.gymapp.repository.templates.WorkoutTemplateDayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.gymapp.service.MuscleService;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class WorkoutTemplateDayServiceImpl implements WorkoutTemplateDayService {

    @Autowired
    private WorkoutTemplateDayRepository repo;

    @Autowired
    private MuscleService muscleService;

    @Autowired
    private WorkoutDayRepository workoutDayRepository;

    private final Path path = Paths.get("uploads/day");
    

    @Override
    public WorkoutTemplateDayResponse setMuscleImage(Long id, MultipartFile file) throws IOException {

        WorkoutTemplateDay day = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Day not found"));

        Files.createDirectories(path);

        String previousImage = day.getMuscleImage();

        String original = file.getOriginalFilename();
        if (original == null || !original.contains(".")) {
            throw new RuntimeException("Archivo inválido");
        }
        String ext = original.substring(original.lastIndexOf("."));
        String fileName = UUID.randomUUID() + ext;

        Files.copy(file.getInputStream(), path.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

        day.setMuscleImage(fileName);

        WorkoutTemplateDay saved = repo.save(day);

        deleteImageIfUnused(previousImage, null, saved.getId());

        return toResponse(saved);
    }

    @Override
    public WorkoutTemplateDayResponse deleteMuscleImage(Long id) throws IOException {

        WorkoutTemplateDay day = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Day not found"));

        String previousImage = day.getMuscleImage();

        if (day.getMuscleImage() != null) {
            day.setMuscleImage(null);
        }

        WorkoutTemplateDay saved = repo.save(day);

        deleteImageIfUnused(previousImage, null, saved.getId());

        return toResponse(saved);
    }

    @Override
    public ResponseEntity<Resource> getMuscleImage(String filename) throws IOException {

        Path filePath = path.resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("Imagen no encontrada");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, Files.probeContentType(filePath))
                .body(resource);
    }

    @Override
    public void deleteTemplateDay(Long id) {

        WorkoutTemplateDay day = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Day not found"));

        String imageName = day.getMuscleImage();

        repo.deleteById(id);

        try {
            deleteImageIfUnused(imageName, null, null);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private WorkoutTemplateDayResponse toResponse(WorkoutTemplateDay d) {
        return new WorkoutTemplateDayResponse(
                d.getId(),
                d.getName(),
                muscleService.getMusclesFromTemplateDay(d),
                d.getDayOrder(),
                d.getMuscleImage(),
                d.getTemplate().getId()
        );
    }

    public void deleteImageByFilename(String filename) throws IOException {
        deleteImageIfUnused(filename, null, null);
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
                ? repo.countByMuscleImageAndIdNot(filename, excludeTemplateDayId)
                : repo.countByMuscleImage(filename);

        if (workoutRefs + templateRefs > 0) {
            return;
        }

        Path filePath = path.resolve(filename).normalize();
        Files.deleteIfExists(filePath);
    }
}