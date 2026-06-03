package com.gymapp.config;

import com.gymapp.script.CopyLastWorkoutsScript;
import com.gymapp.service.ScheduledTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StartupTaskChecker {

    private static final String TASK_NAME = "COPY_LAST_WORKOUTS";

    private final CopyLastWorkoutsScript copyLastWorkoutsScript;
    private final ScheduledTaskService scheduledTaskService;

    @EventListener(ApplicationReadyEvent.class)
    public void checkMissedTasks() {

        System.out.println("[StartupTaskChecker] Verificando tareas pendientes...");

        if (!scheduledTaskService.shouldExecute(TASK_NAME)) {
            System.out.println("[StartupTaskChecker] La tarea ya fue ejecutada esta semana.");
            return;
        }

        System.out.println("[StartupTaskChecker] Ejecutando tarea pendiente.");

        copyLastWorkoutsScript.execute();

        scheduledTaskService.markAsExecuted(TASK_NAME);

        System.out.println("[StartupTaskChecker] Tarea completada.");
    }
}