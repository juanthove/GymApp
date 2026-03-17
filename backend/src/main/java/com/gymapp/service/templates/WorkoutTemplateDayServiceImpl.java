package com.gymapp.service.templates;

import com.gymapp.dto.request.templates.WorkoutTemplateDayRequest;
import com.gymapp.dto.response.templates.WorkoutTemplateDayResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.templates.WorkoutTemplate;
import com.gymapp.model.templates.WorkoutTemplateDay;
import com.gymapp.repository.templates.WorkoutTemplateRepository;
import com.gymapp.repository.templates.WorkoutTemplateDayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkoutTemplateDayServiceImpl implements WorkoutTemplateDayService {

    @Autowired
    private WorkoutTemplateDayRepository workoutTemplateDayRepository;

    @Autowired
    private WorkoutTemplateRepository workoutTemplateRepository;

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
        return workoutTemplateDayRepository.findByTemplateId(templateId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public WorkoutTemplateDayResponse createTemplateDay(WorkoutTemplateDayRequest request) {
        WorkoutTemplate template = workoutTemplateRepository.findById(request.templateId())
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));
        WorkoutTemplateDay day = new WorkoutTemplateDay();
        day.setName(request.name());
        day.setMuscles(request.muscles());
        day.setTemplate(template);
        return toResponse(workoutTemplateDayRepository.save(day));
    }

    @Override
    public WorkoutTemplateDayResponse updateTemplateDay(Long id, WorkoutTemplateDayRequest request) {
        WorkoutTemplateDay day = workoutTemplateDayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutTemplateDay not found"));
        day.setName(request.name());
        day.setMuscles(request.muscles());
        return toResponse(workoutTemplateDayRepository.save(day));
    }

    @Override
    public void deleteTemplateDay(Long id) {
        workoutTemplateDayRepository.deleteById(id);
    }

    private WorkoutTemplateDayResponse toResponse(WorkoutTemplateDay day) {
        Long templateId = day.getTemplate() != null ? day.getTemplate().getId() : null;
        return new WorkoutTemplateDayResponse(day.getId(), day.getName(), day.getMuscles(), templateId);
    }
}
