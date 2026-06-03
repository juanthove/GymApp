package com.gymapp.repository;

import com.gymapp.model.ScheduledTask;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduledTaskRepository
        extends JpaRepository<ScheduledTask, String> {
}