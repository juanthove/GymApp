package com.gymapp.model;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
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

    private String image;

    @OneToOne
    @JoinColumn(name = "current_workout_id")
    private Workout currentWorkout;

    @ManyToOne
    @JoinColumn(name = "user_level_id")
    private UserLevel userLevel;

    private int totalWorkoutDays = 0;

    private int currentWeekWorkoutCount = 0;

    private LocalDate streakStartDate;

    private LocalDate lastWorkoutDate;

}