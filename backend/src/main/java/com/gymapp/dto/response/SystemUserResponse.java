package com.gymapp.dto.response;

import com.gymapp.model.SystemUserType;

public record SystemUserResponse(
        Long id,
        String username,
        SystemUserType role
) {}