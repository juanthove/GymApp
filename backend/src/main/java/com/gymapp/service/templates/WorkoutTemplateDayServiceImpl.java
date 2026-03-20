package com.gymapp.service.templates;

import com.gymapp.dto.request.templates.WorkoutTemplateDayRequest;
import com.gymapp.dto.response.templates.WorkoutTemplateDayResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.templates.WorkoutTemplate;
import com.gymapp.model.templates.WorkoutTemplateDay;
import com.gymapp.repository.templates.WorkoutTemplateRepository;
import com.gymapp.repository.templates.WorkoutTemplateDayRepository;
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
public class WorkoutTemplateDayServiceImpl implements WorkoutTemplateDayService {

    @Autowired
    private WorkoutTemplateDayRepository workoutTemplateDayRepository;

    @Autowired
    private WorkoutTemplateRepository workoutTemplateRepository;

    private final Path muscleImagePath = Paths.get("uploads/day");

    @Override
    public List<WorkoutTemplateDayResponse> getAllTemplateDays() {
        return workoutTemplateDayRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutTemplateDayResponse getTemplateDayById(Long id) {
        return toResponse(workoutTemplateDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutTemplateDay not found")));
    }

    @Override
    public List<WorkoutTemplateDayResponse> getDaysByTemplate(Long templateId) {
        return workoutTemplateDayRepository.findByTemplateIdOrderByDayOrder(templateId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutTemplateDayResponse createTemplateDay(WorkoutTemplateDayRequest request) {
        WorkoutTemplate template = workoutTemplateRepository.findById(request.templateId())
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));
        WorkoutTemplateDay day = new WorkoutTemplateDay();
        day.setName(request.name());
        day.setMuscles(request.muscles());
        day.setDayOrder(request.dayOrder());
        day.setTemplate(template);
        return toResponse(workoutTemplateDayRepository.save(day));
    }

    @Override
    public WorkoutTemplateDayResponse updateTemplateDay(Long id, WorkoutTemplateDayRequest request) {

        WorkoutTemplateDay day = workoutTemplateDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutTemplateDay not found"));

        day.setName(request.name());
        day.setMuscles(request.muscles());
        day.setDayOrder(request.dayOrder());

        return toResponse(workoutTemplateDayRepository.save(day));
    }

    @Override
    public WorkoutTemplateDayResponse setMuscleImage(Long id, MultipartFile muscleImage) throws IOException {

        WorkoutTemplateDay day = workoutTemplateDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutTemplateDay not found"));

        if (muscleImage == null || muscleImage.isEmpty()) {
            throw new IllegalArgumentException("El archivo muscleImage es requerido");
        }

        Files.createDirectories(muscleImagePath);

        // borrar anterior
        if (day.getMuscleImage() != null) {
            Files.deleteIfExists(muscleImagePath.resolve(day.getMuscleImage()));
        }

        String extension = getExtension(muscleImage.getOriginalFilename());

        // 🔥 NOMBRE SEGURO
        String imageName = "day_" + day.getId() + "." + extension;

        Files.copy(
                muscleImage.getInputStream(),
                muscleImagePath.resolve(imageName),
                StandardCopyOption.REPLACE_EXISTING
        );

        day.setMuscleImage(imageName);

        return toResponse(workoutTemplateDayRepository.save(day));
    }

    @Override
    public WorkoutTemplateDayResponse deleteMuscleImage(Long id) throws IOException {
        WorkoutTemplateDay day = workoutTemplateDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutTemplateDay not found"));

        if (day.getMuscleImage() != null) {
            Files.deleteIfExists(muscleImagePath.resolve(day.getMuscleImage()));
            day.setMuscleImage(null);
            workoutTemplateDayRepository.save(day);
        }

        return toResponse(day);
    }

    @Override
    public ResponseEntity<Resource> getMuscleImage(String filename) throws IOException {
        Path filePath = muscleImagePath.resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists()) {
            throw new RuntimeException("Muscle image no encontrada");
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, Files.probeContentType(filePath))
                .body(resource);
    }

    @Override
    public void deleteTemplateDay(Long id) {
        WorkoutTemplateDay day = workoutTemplateDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutTemplateDay not found"));
        if (day.getMuscleImage() != null) {
            try {
                Files.deleteIfExists(muscleImagePath.resolve(day.getMuscleImage()));
            } catch (IOException e) {
                throw new RuntimeException("Error borrando muscleImage", e);
            }
        }
        workoutTemplateDayRepository.deleteById(id);
    }

    private String getExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            throw new IllegalArgumentException("Nombre de archivo inválido para obtener extensión");
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1);
    }

    private WorkoutTemplateDayResponse toResponse(WorkoutTemplateDay day) {
        Long templateId = day.getTemplate() != null ? day.getTemplate().getId() : null;

        return new WorkoutTemplateDayResponse(
                day.getId(),
                day.getName(),
                day.getMuscles(),
                day.getDayOrder(),
                day.getMuscleImage(),
                templateId
        );
    }
}
