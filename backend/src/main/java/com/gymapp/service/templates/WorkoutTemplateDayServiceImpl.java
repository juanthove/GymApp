package com.gymapp.service.templates;

import com.gymapp.model.templates.WorkoutTemplateDay;
import com.gymapp.repository.templates.WorkoutTemplateDayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WorkoutTemplateDayServiceImpl implements WorkoutTemplateDayService {

    @Autowired
    private WorkoutTemplateDayRepository workoutTemplateDayRepository;

    @Override
    public List<WorkoutTemplateDay> getAllTemplateDays() {
        return workoutTemplateDayRepository.findAll();
    }

    @Override
    public Optional<WorkoutTemplateDay> getTemplateDayById(Long id) {
        return workoutTemplateDayRepository.findById(id);
    }

    @Override
    public List<WorkoutTemplateDay> getDaysByTemplate(Long templateId) {
        return workoutTemplateDayRepository.findByTemplateId(templateId);
    }

    @Override
    public WorkoutTemplateDay createTemplateDay(WorkoutTemplateDay day) {
        return workoutTemplateDayRepository.save(day);
    }

    @Override
    public WorkoutTemplateDay updateTemplateDay(Long id, WorkoutTemplateDay updatedDay) {
        return workoutTemplateDayRepository.findById(id).map(day -> {
            day.setName(updatedDay.getName());
            day.setMuscles(updatedDay.getMuscles());
            day.setTemplate(updatedDay.getTemplate());
            return workoutTemplateDayRepository.save(day);
        }).orElseThrow(() -> new RuntimeException("WorkoutTemplateDay not found"));
    }

    @Override
    public void deleteTemplateDay(Long id) {
        workoutTemplateDayRepository.deleteById(id);
    }
}
