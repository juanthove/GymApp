package com.gymapp.controller.templates;


import com.gymapp.model.Exercise;
import com.gymapp.model.templates.WorkoutTemplate;
import com.gymapp.model.templates.WorkoutTemplateDay;
import com.gymapp.model.templates.WorkoutTemplateExercise;
import com.gymapp.repository.templates.WorkoutTemplateRepository;
import com.gymapp.repository.templates.WorkoutTemplateDayRepository;
import com.gymapp.repository.templates.WorkoutTemplateExerciseRepository;
import com.gymapp.repository.ExerciseRepository;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/workout-template")
public class WorkoutTemplateController {

    @Autowired
    private WorkoutTemplateRepository workoutTemplateRepository;

    @Autowired
    private WorkoutTemplateDayRepository workoutTemplateDayRepository;

    @Autowired
    private WorkoutTemplateExerciseRepository workoutTemplateExerciseRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;


    // Obtener todos los templates
    @GetMapping
    public List<WorkoutTemplate> getAllTemplates() {
        return workoutTemplateRepository.findAll();
    }

    // Obtener template por id
    @GetMapping("/{id}")
    public Optional<WorkoutTemplate> getTemplateById(@PathVariable Long id) {
        return workoutTemplateRepository.findById(id);
    }

    // Crear template
    @PostMapping
    public WorkoutTemplate createTemplate(@RequestBody WorkoutTemplate template) {
        return workoutTemplateRepository.save(template);
    }

    // Actualizar template
    @PutMapping("/{id}")
    public WorkoutTemplate updateTemplate(
            @PathVariable Long id,
            @RequestBody WorkoutTemplate updatedTemplate) {

        return workoutTemplateRepository.findById(id).map(template -> {

            template.setName(updatedTemplate.getName());
            template.setDescription(updatedTemplate.getDescription());

            return workoutTemplateRepository.save(template);

        }).orElseThrow(() -> new RuntimeException("Template not found"));
    }

    // Eliminar template
    @DeleteMapping("/{id}")
    public void deleteTemplate(@PathVariable Long id) {
        workoutTemplateRepository.deleteById(id);
    }

    //Crear un template completo, incluyendo dias y ejercicios
    @SuppressWarnings("unchecked")
    @Transactional
    @PostMapping("/full")
    public WorkoutTemplate createFullTemplate(@RequestBody Map<String, Object> body) {

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

            List<Map<String, Object>> exercises =
                    (List<Map<String, Object>>) dayData.get("exercises");

            for (Map<String, Object> exData : exercises) {

                Long exerciseId =
                        Long.valueOf(exData.get("exerciseId").toString());

                Integer order =
                        Integer.valueOf(exData.get("order").toString());

                Exercise exercise =
                        exerciseRepository.findById(exerciseId)
                        .orElseThrow(() -> new RuntimeException("Exercise not found"));

                WorkoutTemplateExercise templateExercise =
                        new WorkoutTemplateExercise();

                templateExercise.setTemplateDay(day);
                templateExercise.setExercise(exercise);
                templateExercise.setExerciseOrder(order);

                workoutTemplateExerciseRepository.save(templateExercise);
            }
        }

        return template;
    }


    //Obtener los Workout Templates completos
    @GetMapping("/full/{id}")
    public Map<String,Object> getFullTemplate(@PathVariable Long id){

        WorkoutTemplate template = workoutTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        List<WorkoutTemplateDay> days =
                workoutTemplateDayRepository.findByTemplateId(id);

        List<Map<String,Object>> dayList = new ArrayList<>();

        for(WorkoutTemplateDay day : days){

            Map<String,Object> dayData = new HashMap<>();

            dayData.put("id", day.getId());
            dayData.put("name", day.getName());
            dayData.put("muscles", day.getMuscles());

            List<WorkoutTemplateExercise> exercises =
                    workoutTemplateExerciseRepository.findByTemplateDayId(day.getId());

            List<Map<String,Object>> exerciseList = new ArrayList<>();

            for(WorkoutTemplateExercise ex : exercises){

                Map<String,Object> exData = new HashMap<>();

                exData.put("exerciseId", ex.getExercise().getId());
                exData.put("exerciseName", ex.getExercise().getName());
                exData.put("order", ex.getExerciseOrder());

                exerciseList.add(exData);
            }

            dayData.put("exercises", exerciseList);

            dayList.add(dayData);
        }

        Map<String,Object> result = new HashMap<>();

        result.put("id", template.getId());
        result.put("name", template.getName());
        result.put("description", template.getDescription());
        result.put("days", dayList);

        return result;
    }



    //Editar los Workout Temmplates completos
    @SuppressWarnings("unchecked")
    @Transactional
    @PutMapping("/full/{id}")
    public WorkoutTemplate updateFullTemplate(
            @PathVariable Long id,
            @RequestBody Map<String,Object> body){

        WorkoutTemplate template = workoutTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        template.setName((String) body.get("name"));
        template.setDescription((String) body.get("description"));

        workoutTemplateRepository.save(template);

        // eliminar dias existentes
        List<WorkoutTemplateDay> existingDays =
                workoutTemplateDayRepository.findByTemplateId(id);

        for(WorkoutTemplateDay day : existingDays){
            workoutTemplateExerciseRepository.deleteByTemplateDayId(day.getId());
        }

        workoutTemplateDayRepository.deleteByTemplateId(id);

        // crear dias nuevos
        List<Map<String,Object>> days =
                (List<Map<String,Object>>) body.get("days");

        for(Map<String,Object> dayData : days){

            WorkoutTemplateDay day = new WorkoutTemplateDay();

            day.setName((String) dayData.get("name"));
            day.setMuscles((String) dayData.get("muscles"));
            day.setTemplate(template);

            day = workoutTemplateDayRepository.save(day);

            List<Map<String,Object>> exercises =
                    (List<Map<String,Object>>) dayData.get("exercises");

            for(Map<String,Object> exData : exercises){

                Long exerciseId =
                        Long.valueOf(exData.get("exerciseId").toString());

                Integer order =
                        Integer.valueOf(exData.get("order").toString());

                Exercise exercise =
                        exerciseRepository.findById(exerciseId)
                        .orElseThrow(() -> new RuntimeException("Exercise not found"));

                WorkoutTemplateExercise templateExercise =
                        new WorkoutTemplateExercise();

                templateExercise.setTemplateDay(day);
                templateExercise.setExercise(exercise);
                templateExercise.setExerciseOrder(order);

                workoutTemplateExerciseRepository.save(templateExercise);
            }
        }

        return template;
    }


    //Eliminar un Workout Template completo
    @Transactional
    @DeleteMapping("/full/{id}")
    public void deleteFullTemplate(@PathVariable Long id){

        List<WorkoutTemplateDay> days =
                workoutTemplateDayRepository.findByTemplateId(id);

        for(WorkoutTemplateDay day : days){
            workoutTemplateExerciseRepository.deleteByTemplateDayId(day.getId());
        }

        workoutTemplateDayRepository.deleteByTemplateId(id);

        workoutTemplateRepository.deleteById(id);
    }


}

