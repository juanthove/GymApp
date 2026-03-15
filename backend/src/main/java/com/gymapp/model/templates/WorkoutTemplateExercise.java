package com.gymapp.model.templates;

import com.gymapp.model.Exercise;
import jakarta.persistence.*;

@Entity
public class WorkoutTemplateExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "template_day_id")
    private WorkoutTemplateDay templateDay;

    @ManyToOne
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    private Integer exerciseOrder; // orden del ejercicio dentro del día

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public WorkoutTemplateDay getTemplateDay() {
        return templateDay;
    }

    public void setTemplateDay(WorkoutTemplateDay templateDay) {
        this.templateDay = templateDay;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    public Integer getExerciseOrder() {
        return exerciseOrder;
    }

    public void setExerciseOrder(Integer exerciseOrder) {
        this.exerciseOrder = exerciseOrder;
    }
}
