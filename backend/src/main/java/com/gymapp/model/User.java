package com.gymapp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users", uniqueConstraints = {@UniqueConstraint(columnNames = {"name", "surname"})})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String surname;

    private boolean logged;

    private Integer gymDaysPerWeek;

    @OneToOne
    @JoinColumn(name = "current_workout_id")
    private Workout currentWorkout;

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

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public boolean getLogged() {
        return logged;
    }

    public void setLogged(boolean logged) {
        this.logged = logged;
    }

    public Integer getGymDaysPerWeek() {
        return gymDaysPerWeek;
    }

    public void setGymDaysPerWeek(Integer gymDaysPerWeek) {
        this.gymDaysPerWeek = gymDaysPerWeek;
    }

    public Workout getCurrentWorkout() {
        return currentWorkout;
    }

    public void setCurrentWorkout(Workout currentWorkout) {
        this.currentWorkout = currentWorkout;
    }
}