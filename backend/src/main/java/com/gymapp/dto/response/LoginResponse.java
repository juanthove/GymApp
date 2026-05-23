package com.gymapp.dto.response;

import com.gymapp.model.SystemUserType;

public record LoginResponse(
        Long id,
        String username,
        SystemUserType role,
        String token,
        String tokenType,
        long expiresIn
) {}
