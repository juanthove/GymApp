//Representa un día de entrenamiento dentro de un workout, con su nombre, músculos trabajados y ejercicios asociados

package com.gymapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
public class WorkoutDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // Day 1, Push, Pull, etc

    private int dayOrder;

    private String muscleImage;

    private boolean abdominal = false;

    private LocalDateTime startedAt;

    private LocalDateTime finishedAt;

    @ManyToOne
    @JoinColumn(name = "workout_id")
    private Workout workout;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getDayOrder() {
        return dayOrder;
    }

    public void setDayOrder(int dayOrder) {
        this.dayOrder = dayOrder;
    }

    public String getMuscleImage() {
        return muscleImage;
    }

    public void setMuscleImage(String muscleImage) {
        this.muscleImage = muscleImage;
    }

    public boolean getAbdominal() {
        return abdominal;
    }

    public void setAbdominal(boolean abdominal) {
        this.abdominal = abdominal;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(LocalDateTime finishedAt) {
        this.finishedAt = finishedAt;
    }

    public Workout getWorkout() {
        return workout;
    }

    public void setWorkout(Workout workout) {
        this.workout = workout;
    }

    @Transient
    public String getStatus() {

        if(startedAt == null){
            return "NOT_STARTED";
        }

        if(finishedAt == null){
            return "IN_PROGRESS";
        }

        return "COMPLETED";
    }
}