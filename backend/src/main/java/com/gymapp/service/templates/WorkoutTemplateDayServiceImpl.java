package com.gymapp.service.templates;

import com.gymapp.dto.response.templates.WorkoutTemplateDayResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.templates.WorkoutTemplateDay;
import com.gymapp.repository.templates.WorkoutTemplateDayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class WorkoutTemplateDayServiceImpl implements WorkoutTemplateDayService {

    @Autowired
    private WorkoutTemplateDayRepository repo;

    private final Path path = Paths.get("uploads/day");

    @Override
    public WorkoutTemplateDayResponse setMuscleImage(Long id, MultipartFile file) throws IOException {

        WorkoutTemplateDay day = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Day not found"));

        Files.createDirectories(path);

        if (day.getMuscleImage() != null) {
            Files.deleteIfExists(path.resolve(day.getMuscleImage()));
        }

        String original = file.getOriginalFilename();
        if (original == null || !original.contains(".")) {
            throw new RuntimeException("Archivo inválido");
        }
        String ext = original.substring(original.lastIndexOf("."));
        String fileName = UUID.randomUUID() + ext;

        Files.copy(file.getInputStream(), path.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

        day.setMuscleImage(fileName);

        return toResponse(repo.save(day));
    }

    @Override
    public WorkoutTemplateDayResponse deleteMuscleImage(Long id) throws IOException {

        WorkoutTemplateDay day = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Day not found"));

        if (day.getMuscleImage() != null) {
            Files.deleteIfExists(path.resolve(day.getMuscleImage()));
            day.setMuscleImage(null);
        }

        return toResponse(repo.save(day));
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

        try {
            if (day.getMuscleImage() != null) {
                Files.deleteIfExists(path.resolve(day.getMuscleImage()));
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        repo.deleteById(id);
    }

    private WorkoutTemplateDayResponse toResponse(WorkoutTemplateDay d) {
        return new WorkoutTemplateDayResponse(
                d.getId(),
                d.getName(),
                d.getMuscles(),
                d.getDayOrder(),
                d.getMuscleImage(),
                d.getTemplate().getId()
        );
    }

    public void deleteImageByFilename(String filename) throws IOException {
        Path filePath = path.resolve(filename).normalize();
        Files.deleteIfExists(filePath);
    }
}