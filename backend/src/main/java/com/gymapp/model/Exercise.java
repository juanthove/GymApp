package com.gymapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private String description;

    private String image;

    private String video;

    private String icon;

    @Enumerated(EnumType.STRING)
    private MuscleType muscle;

    @Enumerated(EnumType.STRING)
    private ExerciseType type;
}