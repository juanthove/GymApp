package com.gymapp.service.templates;

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

import java.util.*;

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
    public List<WorkoutTemplate> getAllTemplates() {
        return workoutTemplateRepository.findAll();
    }

    @Override
    public Optional<WorkoutTemplate> getTemplateById(Long id) {
        return workoutTemplateRepository.findById(id);
    }

    @Override
    public WorkoutTemplate createTemplate(WorkoutTemplate template) {
        return workoutTemplateRepository.save(template);
    }

    @Override
    public WorkoutTemplate updateTemplate(Long id, WorkoutTemplate updatedTemplate) {
        return workoutTemplateRepository.findById(id).map(template -> {
            template.setName(updatedTemplate.getName());
            template.setDescription(updatedTemplate.getDescription());
            return workoutTemplateRepository.save(template);
        }).orElseThrow(() -> new RuntimeException("Template not found"));
    }

    @Override
    public void deleteTemplate(Long id) {
        workoutTemplateRepository.deleteById(id);
    }

    @Override
    @SuppressWarnings("unchecked")
    @Transactional
    public WorkoutTemplate createFullTemplate(Map<String, Object> body) {
        WorkoutTemplate template = new WorkoutTemplate();
        template.setName((String) body.get("name"));
        template.setDescription((String) body.get("description"));
        template = workoutTemplateRepository.save(template);

        List<Map<String, Object>> days = (List<Map<String, Object>>) body.get("days");

        for (Map<String, Object> dayData : days) {
            WorkoutTemplateDay day = new WorkoutTemplateDay();
            day.setName((String) dayData.get("name"));
            day.setMuscles((String) dayData.get("muscles"));
            day.setTemplate(template);
            day = workoutTemplateDayRepository.save(day);

            List<Map<String, Object>> exercises = (List<Map<String, Object>>) dayData.get("exercises");

            for (Map<String, Object> exData : exercises) {
                Long exerciseId = Long.valueOf(exData.get("exerciseId").toString());
                Integer order = Integer.valueOf(exData.get("order").toString());
                Exercise exercise = exerciseRepository.findById(exerciseId)
                        .orElseThrow(() -> new RuntimeException("Exercise not found"));
                WorkoutTemplateExercise templateExercise = new WorkoutTemplateExercise();
                templateExercise.setTemplateDay(day);
                templateExercise.setExercise(exercise);
                templateExercise.setExerciseOrder(order);
                workoutTemplateExerciseRepository.save(templateExercise);
            }
        }

        return template;
    }

    @Override
    public Map<String, Object> getFullTemplate(Long id) {
        WorkoutTemplate template = workoutTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        List<WorkoutTemplateDay> days = workoutTemplateDayRepository.findByTemplateId(id);
        List<Map<String, Object>> dayList = new ArrayList<>();

        for (WorkoutTemplateDay day : days) {
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("id", day.getId());
            dayData.put("name", day.getName());
            dayData.put("muscles", day.getMuscles());

            List<WorkoutTemplateExercise> exercises =
                    workoutTemplateExerciseRepository.findByTemplateDayId(day.getId());
            List<Map<String, Object>> exerciseList = new ArrayList<>();

            for (WorkoutTemplateExercise ex : exercises) {
                Map<String, Object> exData = new HashMap<>();
                exData.put("exerciseId", ex.getExercise().getId());
                exData.put("exerciseName", ex.getExercise().getName());
                exData.put("order", ex.getExerciseOrder());
                exerciseList.add(exData);
            }

            dayData.put("exercises", exerciseList);
            dayList.add(dayData);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("id", template.getId());
        result.put("name", template.getName());
        result.put("description", template.getDescription());
        result.put("days", dayList);

        return result;
    }

    @Override
    @SuppressWarnings("unchecked")
    @Transactional
    public WorkoutTemplate updateFullTemplate(Long id, Map<String, Object> body) {
        WorkoutTemplate template = workoutTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        template.setName((String) body.get("name"));
        template.setDescription((String) body.get("description"));
        workoutTemplateRepository.save(template);

        List<WorkoutTemplateDay> existingDays = workoutTemplateDayRepository.findByTemplateId(id);
        for (WorkoutTemplateDay day : existingDays) {
            workoutTemplateExerciseRepository.deleteByTemplateDayId(day.getId());
        }
        workoutTemplateDayRepository.deleteByTemplateId(id);

        List<Map<String, Object>> days = (List<Map<String, Object>>) body.get("days");

        for (Map<String, Object> dayData : days) {
            WorkoutTemplateDay day = new WorkoutTemplateDay();
            day.setName((String) dayData.get("name"));
            day.setMuscles((String) dayData.get("muscles"));
            day.setTemplate(template);
            day = workoutTemplateDayRepository.save(day);

            List<Map<String, Object>> exercises = (List<Map<String, Object>>) dayData.get("exercises");

            for (Map<String, Object> exData : exercises) {
                Long exerciseId = Long.valueOf(exData.get("exerciseId").toString());
                Integer order = Integer.valueOf(exData.get("order").toString());
                Exercise exercise = exerciseRepository.findById(exerciseId)
                        .orElseThrow(() -> new RuntimeException("Exercise not found"));
                WorkoutTemplateExercise templateExercise = new WorkoutTemplateExercise();
                templateExercise.setTemplateDay(day);
                templateExercise.setExercise(exercise);
                templateExercise.setExerciseOrder(order);
                workoutTemplateExerciseRepository.save(templateExercise);
            }
        }

        return template;
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
}
