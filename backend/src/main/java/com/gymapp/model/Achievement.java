package com.gymapp.model;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Achievement {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private AchievementType type;

    @ManyToOne
    private UserLevel level;

    private Double requiredValue; // Valor requerido, dependiendo el tipo es lo que representa

    private String image;

    @Enumerated(EnumType.STRING)
    private MuscleType muscle;

    @ManyToMany
    @JoinTable(name = "achievement_exercises", joinColumns = @JoinColumn(name = "achievement_id"), inverseJoinColumns = @JoinColumn(name = "exercise_id"))
    private Set<Exercise> exercises = new HashSet<>();

    @OneToMany(mappedBy = "achievement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserAchievement> userAchievements = new ArrayList<>();
}