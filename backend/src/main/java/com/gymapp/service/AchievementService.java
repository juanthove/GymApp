package com.gymapp.service;

import com.gymapp.dto.request.AchievementRequest;
import com.gymapp.dto.response.AchievementResponse;

import java.util.List;

public interface AchievementService {

    List<AchievementResponse> getAllAchievements();

    AchievementResponse getAchievementById(Long id);

    AchievementResponse createAchievement(AchievementRequest request);

    AchievementResponse updateAchievement(Long id, AchievementRequest request);

    void deleteAchievement(Long id);
}