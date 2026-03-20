package com.gymapp.model.templates;

import jakarta.persistence.*;

@Entity
public class WorkoutTemplateDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // Day 1, Push, Pull, etc

    private String muscles;

    private Integer dayOrder;

    private String muscleImage; //Imagen del cuerpo con los musculos

    @ManyToOne
    @JoinColumn(name = "template_id")
    private WorkoutTemplate template;

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

    public Integer getDayOrder() {
        return dayOrder;
    }

    public void setDayOrder(Integer dayOrder) {
        this.dayOrder = dayOrder;
    }

    public String getMuscleImage() {
        return muscleImage;
    }

    public void setMuscleImage(String muscleImage) {
        this.muscleImage = muscleImage;
    }

    public WorkoutTemplate getTemplate() {
        return template;
    }

    public void setTemplate(WorkoutTemplate template) {
        this.template = template;
    }
}
