package com.gymapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class UserLevel {

    @Id
    @GeneratedValue
    private Long id;

    private String name; // BEGINNER, INTERMEDIATE...

    private int levelOrder; // 1, 2, 3, 4
}
