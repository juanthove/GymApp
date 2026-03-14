//Representa un día de entrenamiento dentro de un workout, con su nombre, músculos trabajados y ejercicios asociados

package com.gymapp.model;

import jakarta.persistence.*;

@Entity
public class WorkoutDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // Day 1, Push, Pull, etc

    private String muscles;

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

    public String getMuscles() {
        return muscles;
    }

    public void setMuscles(String muscles) {
        this.muscles = muscles;
    }

    public Workout getWorkout() {
        return workout;
    }

    public void setWorkout(Workout workout) {
        this.workout = workout;
    }
}