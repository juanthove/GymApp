package com.gymapp.dto.response;

public record UserLevelResponse(
        Long id,
        String name,
        int levelOrder
) {}