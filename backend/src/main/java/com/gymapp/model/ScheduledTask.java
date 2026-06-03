package com.gymapp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "scheduled_tasks")
public class ScheduledTask {

    @Id
    private String taskName;

    private LocalDate lastExecutionDate;
}