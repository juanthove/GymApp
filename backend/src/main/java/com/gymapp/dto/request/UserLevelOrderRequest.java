package com.gymapp.dto.request;

public record UserLevelOrderRequest(
        Long id,
        int levelOrder
) {}