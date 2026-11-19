package com.gymapp.dto.response;

import java.util.List;

public record WeeklyMuscleVolumePageResponse(
        List<WeeklyMuscleVolumeResponse> content,
        int currentPage,
        int pageSize,
        int totalPages,
        long totalWeeks) {
}