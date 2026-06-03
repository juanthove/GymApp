package com.gymapp.service;

import com.gymapp.model.ScheduledTask;
import com.gymapp.repository.ScheduledTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

@Service
@RequiredArgsConstructor
public class ScheduledTaskServiceImpl implements ScheduledTaskService {

    private final ScheduledTaskRepository repository;

    @Override
    public boolean shouldExecute(String taskName) {

        LocalDate lastSunday = LocalDate.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));

        return repository.findById(taskName)
                .map(task -> task.getLastExecutionDate().isBefore(lastSunday))
                .orElse(true);
    }

    @Override
    public void markAsExecuted(String taskName) {

        ScheduledTask task = repository.findById(taskName)
                .orElse(new ScheduledTask());

        task.setTaskName(taskName);
        task.setLastExecutionDate(LocalDate.now());

        repository.save(task);
    }
}