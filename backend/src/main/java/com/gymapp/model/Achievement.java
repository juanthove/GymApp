package com.gymapp.model;

import java.util.ArrayList;
import java.util.List;

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

    @Enumerated(EnumType.STRING)
    private MuscleType muscle;

    @ManyToOne
    private Exercise exercise;

    @OneToMany(mappedBy = "achievement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserAchievement> userAchievements = new ArrayList<>();
}