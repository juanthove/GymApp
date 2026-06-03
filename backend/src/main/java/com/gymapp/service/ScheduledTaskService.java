package com.gymapp.service;

public interface ScheduledTaskService {

    boolean shouldExecute(String taskName);

    void markAsExecuted(String taskName);
}