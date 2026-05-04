//Representa un día de entrenamiento dentro de un workout, con su nombre, músculos trabajados y ejercicios asociados

package com.gymapp.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
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