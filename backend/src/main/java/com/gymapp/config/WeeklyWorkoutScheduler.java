package com.gymapp.config;

import com.gymapp.script.CopyLastWorkoutsScript;
import com.gymapp.service.ScheduledTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WeeklyWorkoutScheduler {

    private static final String TASK_NAME = "COPY_LAST_WORKOUTS";

    private final CopyLastWorkoutsScript copyLastWorkoutsScript;
    private final ScheduledTaskService scheduledTaskService;

    @Scheduled(cron = "0 0 3 * * SUN")
    public void executeWeeklyCopy() {

        if (!scheduledTaskService.shouldExecute(TASK_NAME)) {
            return;
        }

        copyLastWorkoutsScript.execute();

        scheduledTaskService.markAsExecuted(TASK_NAME);
    }
}