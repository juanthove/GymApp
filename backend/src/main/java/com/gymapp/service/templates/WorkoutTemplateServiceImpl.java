package com.gymapp.service.templates;

import com.gymapp.dto.request.templates.WorkoutTemplateFullRequest;
import com.gymapp.dto.request.templates.WorkoutTemplateRequest;
import com.gymapp.dto.response.templates.WorkoutTemplateFullResponse;
import com.gymapp.dto.response.templates.WorkoutTemplateResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.Exercise;
import com.gymapp.model.templates.WorkoutTemplate;
import com.gymapp.model.templates.WorkoutTemplateDay;
import com.gymapp.model.templates.WorkoutTemplateExercise;
import com.gymapp.repository.ExerciseRepository;
import com.gymapp.repository.templates.WorkoutTemplateDayRepository;
import com.gymapp.repository.templates.WorkoutTemplateExerciseRepository;
import com.gymapp.repository.templates.WorkoutTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class WorkoutTemplateServiceImpl implements WorkoutTemplateService {

    @Autowired
    private WorkoutTemplateRepository workoutTemplateRepository;

    @Autowired
    private WorkoutTemplateDayRepository workoutTemplateDayRepository;

    @Autowired
    private WorkoutTemplateExerciseRepository workoutTemplateExerciseRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    private final Path muscleImagePath = Paths.get("uploads/day");

    @Override
    public List<WorkoutTemplateResponse> getAllTemplates() {
        return workoutTemplateRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutTemplateResponse getTemplateById(Long id) {
        return toResponse(workoutTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found")));
    }

    @Override
    public WorkoutTemplateResponse createTemplate(WorkoutTemplateRequest request) {
        WorkoutTemplate template = new WorkoutTemplate();
        template.setName(request.name());
        template.setDescription(request.description());
        return toResponse(workoutTemplateRepository.save(template));
    }

    @Override
    public WorkoutTemplateResponse updateTemplate(Long id, WorkoutTemplateRequest request) {
        WorkoutTemplate template = workoutTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));
        template.setName(request.name());
        template.setDescription(request.description());
        return toResponse(workoutTemplateRepository.save(template));
    }

    @Override
    public void deleteTemplate(Long id) {
        workoutTemplateRepository.deleteById(id);
    }

    @Override
    @Transactional
    public WorkoutTemplateResponse createFullTemplate(WorkoutTemplateFullRequest request) {
        WorkoutTemplate template = new WorkoutTemplate();
        template.setName(request.name());
        template.setDescription(request.description());
        template = workoutTemplateRepository.save(template);

        for (WorkoutTemplateFullRequest.DayItem dayData : request.days()) {
            WorkoutTemplateDay day = new WorkoutTemplateDay();
            day.setName(dayData.name());
            day.setMuscles(dayData.muscles());
            day.setDayOrder(dayData.dayOrder());
            day.setTemplate(template);
            day = workoutTemplateDayRepository.save(day);

            for (WorkoutTemplateFullRequest.ExerciseItem exData : dayData.exercises()) {
                Exercise exercise = exerciseRepository.findById(exData.exerciseId())
                        .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));
                WorkoutTemplateExercise templateExercise = new WorkoutTemplateExercise();
                templateExercise.setTemplateDay(day);
                templateExercise.setExercise(exercise);
                templateExercise.setExerciseOrder(exData.order());
                workoutTemplateExerciseRepository.save(templateExercise);
            }
        }

        return toResponse(template);
    }

    @Override
    public WorkoutTemplateFullResponse getFullTemplate(Long id) {
        WorkoutTemplate template = workoutTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        List<WorkoutTemplateDay> days = workoutTemplateDayRepository.findByTemplateIdOrderByDayOrder(id);
        List<WorkoutTemplateFullResponse.DayItem> dayList = new ArrayList<>();

        for (WorkoutTemplateDay day : days) {
            List<WorkoutTemplateExercise> exercises =
                    workoutTemplateExerciseRepository.findByTemplateDayId(day.getId());
            List<WorkoutTemplateFullResponse.ExerciseItem> exerciseList = exercises.stream()
                    .map(ex -> new WorkoutTemplateFullResponse.ExerciseItem(
                            ex.getId(), ex.getExercise().getId(), ex.getExercise().getName(), ex.getExerciseOrder()))
                    .toList();
            dayList.add(new WorkoutTemplateFullResponse.DayItem(
                    day.getId(),
                    day.getName(),
                    day.getMuscles(),
                    day.getDayOrder(),
                    day.getMuscleImage(),
                    exerciseList));
        }

        return new WorkoutTemplateFullResponse(template.getId(), template.getName(), template.getDescription(), dayList);
    }

    @Override
    @Transactional
    public WorkoutTemplateResponse updateFullTemplate(Long id, WorkoutTemplateFullRequest request) {

        WorkoutTemplate template = workoutTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        template.setName(request.name());
        template.setDescription(request.description());
        workoutTemplateRepository.save(template);

        // 🔥 SOLO borrar relaciones (NO imágenes)
        List<WorkoutTemplateDay> existingDays = workoutTemplateDayRepository.findByTemplateId(id);

        for (WorkoutTemplateDay day : existingDays) {
            workoutTemplateExerciseRepository.deleteByTemplateDayId(day.getId());
        }

        // ⚠️ NO borrar imágenes acá
        workoutTemplateDayRepository.deleteByTemplateId(id);

        // 🔥 recrear días SIN tocar imágenes
        for (WorkoutTemplateFullRequest.DayItem dayData : request.days()) {

            WorkoutTemplateDay day = new WorkoutTemplateDay();
            day.setName(dayData.name());
            day.setMuscles(dayData.muscles());
            day.setDayOrder(dayData.dayOrder());
            day.setTemplate(template);

            // 🚫 NO tocar muscleImage acá
            day = workoutTemplateDayRepository.save(day);

            for (WorkoutTemplateFullRequest.ExerciseItem exData : dayData.exercises()) {
                Exercise exercise = exerciseRepository.findById(exData.exerciseId())
                        .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));

                WorkoutTemplateExercise templateExercise = new WorkoutTemplateExercise();
                templateExercise.setTemplateDay(day);
                templateExercise.setExercise(exercise);
                templateExercise.setExerciseOrder(exData.order());

                workoutTemplateExerciseRepository.save(templateExercise);
            }
        }

        return toResponse(template);
    }

    @Override
    @Transactional
    public void deleteFullTemplate(Long id) {
        List<WorkoutTemplateDay> days = workoutTemplateDayRepository.findByTemplateId(id);
        for (WorkoutTemplateDay day : days) {
            workoutTemplateExerciseRepository.deleteByTemplateDayId(day.getId());
            if (day.getMuscleImage() != null) {
                try {
                    Files.deleteIfExists(muscleImagePath.resolve(day.getMuscleImage()));
                } catch (IOException e) {
                    throw new RuntimeException("Error al eliminar muscleImage del dia", e);
                }
            }
        }
        workoutTemplateDayRepository.deleteByTemplateId(id);
        workoutTemplateRepository.deleteById(id);
    }


    private WorkoutTemplateResponse toResponse(WorkoutTemplate template) {
        return new WorkoutTemplateResponse(template.getId(), template.getName(), template.getDescription());
    }
}
