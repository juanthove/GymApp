package com.gymapp.service.templates;

import com.gymapp.dto.request.templates.WorkoutTemplateFullRequest;
import com.gymapp.dto.request.templates.WorkoutTemplateRequest;
import com.gymapp.dto.response.templates.WorkoutTemplateFullResponse;
import com.gymapp.dto.response.templates.WorkoutTemplateResponse;
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

    @Override
    public List<WorkoutTemplateResponse> getAllTemplates() {
        return workoutTemplateRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutTemplateResponse getTemplateById(Long id) {
        return toResponse(workoutTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found")));
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
                .orElseThrow(() -> new RuntimeException("Template not found"));
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
            day.setTemplate(template);
            day = workoutTemplateDayRepository.save(day);

            for (WorkoutTemplateFullRequest.ExerciseItem exData : dayData.exercises()) {
                Exercise exercise = exerciseRepository.findById(exData.exerciseId())
                        .orElseThrow(() -> new RuntimeException("Exercise not found"));
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
                .orElseThrow(() -> new RuntimeException("Template not found"));

        List<WorkoutTemplateDay> days = workoutTemplateDayRepository.findByTemplateId(id);
        List<WorkoutTemplateFullResponse.DayItem> dayList = new ArrayList<>();

        for (WorkoutTemplateDay day : days) {
            List<WorkoutTemplateExercise> exercises =
                    workoutTemplateExerciseRepository.findByTemplateDayId(day.getId());
            List<WorkoutTemplateFullResponse.ExerciseItem> exerciseList = exercises.stream()
                    .map(ex -> new WorkoutTemplateFullResponse.ExerciseItem(
                            ex.getId(), ex.getExercise().getId(), ex.getExercise().getName(), ex.getExerciseOrder()))
                    .toList();
            dayList.add(new WorkoutTemplateFullResponse.DayItem(
                    day.getId(), day.getName(), day.getMuscles(), exerciseList));
        }

        return new WorkoutTemplateFullResponse(template.getId(), template.getName(), template.getDescription(), dayList);
    }

    @Override
    @Transactional
    public WorkoutTemplateResponse updateFullTemplate(Long id, WorkoutTemplateFullRequest request) {
        WorkoutTemplate template = workoutTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        template.setName(request.name());
        template.setDescription(request.description());
        workoutTemplateRepository.save(template);

        List<WorkoutTemplateDay> existingDays = workoutTemplateDayRepository.findByTemplateId(id);
        for (WorkoutTemplateDay day : existingDays) {
            workoutTemplateExerciseRepository.deleteByTemplateDayId(day.getId());
        }
        workoutTemplateDayRepository.deleteByTemplateId(id);

        for (WorkoutTemplateFullRequest.DayItem dayData : request.days()) {
            WorkoutTemplateDay day = new WorkoutTemplateDay();
            day.setName(dayData.name());
            day.setMuscles(dayData.muscles());
            day.setTemplate(template);
            day = workoutTemplateDayRepository.save(day);

            for (WorkoutTemplateFullRequest.ExerciseItem exData : dayData.exercises()) {
                Exercise exercise = exerciseRepository.findById(exData.exerciseId())
                        .orElseThrow(() -> new RuntimeException("Exercise not found"));
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
        }
        workoutTemplateDayRepository.deleteByTemplateId(id);
        workoutTemplateRepository.deleteById(id);
    }

    private WorkoutTemplateResponse toResponse(WorkoutTemplate template) {
        return new WorkoutTemplateResponse(template.getId(), template.getName(), template.getDescription());
    }
}
