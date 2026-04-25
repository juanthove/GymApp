package com.gymapp.dto.request;

import com.gymapp.model.SystemUserType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SystemUserRequest(

        @NotBlank
        @Size(max = 50)
        String username,

        @Size(max = 100)
        String password,

        @NotNull
        SystemUserType role
) {}