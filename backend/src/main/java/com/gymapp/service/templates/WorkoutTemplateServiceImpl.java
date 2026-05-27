package com.gymapp.service.templates;

import com.gymapp.dto.request.templates.WorkoutTemplateFullRequest;
import com.gymapp.dto.response.templates.WorkoutTemplateFullResponse;
import com.gymapp.dto.response.templates.WorkoutTemplateResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.Exercise;
import com.gymapp.model.templates.*;
import com.gymapp.repository.WorkoutDayRepository;
import com.gymapp.repository.ExerciseRepository;
import com.gymapp.repository.templates.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.gymapp.service.MuscleService;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.Set;
import java.util.Objects;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.io.IOException;

@Service
public class WorkoutTemplateServiceImpl implements WorkoutTemplateService {

    private final Path dayImagePath = Paths.get("uploads/day");

    @Autowired
    private WorkoutTemplateRepository templateRepo;

    @Autowired
    private WorkoutTemplateDayRepository dayRepo;

    @Autowired
    private WorkoutTemplateExerciseRepository exerciseRepo;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private MuscleService muscleService;

    @Autowired
    private WorkoutDayRepository workoutDayRepository;

    @Override
    public List<WorkoutTemplateResponse> getAllTemplates() {
        return templateRepo.findAll().stream()
                .map(t -> new WorkoutTemplateResponse(t.getId(), t.getName(), t.getDescription()))
                .toList();
    }

    @Override
    @Transactional
    public WorkoutTemplateResponse createFullTemplate(WorkoutTemplateFullRequest request) {

        WorkoutTemplate template = new WorkoutTemplate();
        template.setName(request.name());
        template.setDescription(request.description());
        template = templateRepo.save(template);

        for (WorkoutTemplateFullRequest.DayItem d : request.days()) {

            WorkoutTemplateDay day = new WorkoutTemplateDay();
            day.setName(d.name());
            day.setDayOrder(d.dayOrder());
            day.setMuscleImage(d.muscleImage());
            day.setTemplate(template);
            day = dayRepo.save(day);

            for (WorkoutTemplateFullRequest.ExerciseItem ex : d.exercises()) {

                Exercise exercise = exerciseRepository.findById(ex.exerciseId())
                        .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));

                WorkoutTemplateExercise te = new WorkoutTemplateExercise();
                te.setTemplateDay(day);
                te.setExercise(exercise);
                te.setExerciseOrder(ex.order());

                exerciseRepo.save(te);
            }
        }

        return new WorkoutTemplateResponse(template.getId(), template.getName(), template.getDescription());
    }

    @Override
    public WorkoutTemplateFullResponse getFullTemplate(Long id) {

        WorkoutTemplate template = templateRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        List<WorkoutTemplateDay> days = dayRepo.findByTemplateIdOrderByDayOrder(id);

        List<WorkoutTemplateFullResponse.DayItem> dayList = new ArrayList<>();

        for (WorkoutTemplateDay day : days) {

            List<WorkoutTemplateExercise> exercises = exerciseRepo.findByTemplateDayIdOrderByExerciseOrder(day.getId());

            List<WorkoutTemplateFullResponse.ExerciseItem> exList =
                    exercises.stream()
                            .map(ex -> new WorkoutTemplateFullResponse.ExerciseItem(
                                    ex.getId(),
                                    ex.getExercise().getId(),
                                    ex.getExercise().getName(),
                                    ex.getExerciseOrder()
                            ))
                            .toList();

            dayList.add(new WorkoutTemplateFullResponse.DayItem(
                    day.getId(),
                    day.getName(),
                    muscleService.getMusclesFromTemplateDay(day),
                    day.getDayOrder(),
                    day.getMuscleImage(),
                    exList
            ));
        }

        return new WorkoutTemplateFullResponse(
                template.getId(),
                template.getName(),
                template.getDescription(),
                dayList
        );
    }

    @Override
    @Transactional
    public WorkoutTemplateResponse updateFullTemplate(Long id, WorkoutTemplateFullRequest request) {

        WorkoutTemplate template = templateRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        template.setName(request.name());
        template.setDescription(request.description());

        templateRepo.save(template);

        // 🔥 TRAER EXISTENTES
        List<WorkoutTemplateDay> existingDays = dayRepo.findByTemplateId(id);
        Set<String> previousImageNames = existingDays.stream()
            .map(WorkoutTemplateDay::getMuscleImage)
            .filter(Objects::nonNull)
            .collect(java.util.stream.Collectors.toSet());

        // 🔥 MAPA PARA CONTROL
        Map<Long, WorkoutTemplateDay> existingMap = existingDays.stream()
                .collect(Collectors.toMap(WorkoutTemplateDay::getId, d -> d));

        for (WorkoutTemplateFullRequest.DayItem d : request.days()) {

            WorkoutTemplateDay day;

            // 🟡 UPDATE
            if (d.id() != null && existingMap.containsKey(d.id())) {

                day = existingMap.get(d.id());

                day.setName(d.name());
                day.setDayOrder(d.dayOrder());
                day.setMuscleImage(d.muscleImage());

                day = dayRepo.save(day);

                existingMap.remove(d.id());

            } else {
                // 🟢 CREATE
                day = new WorkoutTemplateDay();
                day.setName(d.name());
                day.setDayOrder(d.dayOrder());
                day.setMuscleImage(d.muscleImage());
                day.setTemplate(template);

                day = dayRepo.save(day);
            }

            // 🔥 EJERCICIOS (simple: borrar y recrear SOLO de ese día)
            exerciseRepo.deleteByTemplateDayId(day.getId());

            for (WorkoutTemplateFullRequest.ExerciseItem ex : d.exercises()) {

                Exercise exercise = exerciseRepository.findById(ex.exerciseId())
                        .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));

                WorkoutTemplateExercise te = new WorkoutTemplateExercise();
                te.setTemplateDay(day);
                te.setExercise(exercise);
                te.setExerciseOrder(ex.order());

                exerciseRepo.save(te);
            }
        }

        // 🔴 DELETE días que ya no existen
        for (WorkoutTemplateDay toDelete : existingMap.values()) {
            exerciseRepo.deleteByTemplateDayId(toDelete.getId());
            dayRepo.delete(toDelete);
        }

        for (String imageName : previousImageNames) {
            deleteImageIfUnused(imageName);
        }

        return new WorkoutTemplateResponse(template.getId(), template.getName(), template.getDescription());
    }

    @Override
    @Transactional
    public void deleteFullTemplate(Long id) {

        List<WorkoutTemplateDay> days = dayRepo.findByTemplateId(id);
        Set<String> previousImageNames = days.stream()
                .map(WorkoutTemplateDay::getMuscleImage)
                .filter(Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());

        for (WorkoutTemplateDay day : days) {
            exerciseRepo.deleteByTemplateDayId(day.getId());
        }

        dayRepo.deleteByTemplateId(id);
        templateRepo.deleteById(id);

        for (String imageName : previousImageNames) {
            deleteImageIfUnused(imageName);
        }
    }

    private void deleteImageIfUnused(String imageName) {
        if (imageName == null || imageName.isBlank()) {
            return;
        }

        long workoutRefs = workoutDayRepository.countByMuscleImage(imageName);
        long templateRefs = dayRepo.countByMuscleImage(imageName);

        if (workoutRefs + templateRefs > 0) {
            return;
        }

        try {
            Files.deleteIfExists(dayImagePath.resolve(imageName));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}