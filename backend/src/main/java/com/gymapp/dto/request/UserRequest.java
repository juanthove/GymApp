package com.gymapp.dto.request;

public record UserRequest(
        String name,
        String surname,
        Integer gymDaysPerWeek
) {}
