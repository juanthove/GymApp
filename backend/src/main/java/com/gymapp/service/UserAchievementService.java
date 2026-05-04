package com.gymapp.service;

import com.gymapp.dto.response.UserAchievementResponse;
import com.gymapp.model.Achievement;
import com.gymapp.model.User;

import java.time.LocalDateTime;
import java.util.List;

public interface UserAchievementService {

    List<UserAchievementResponse> getAllUserAchievements();

    UserAchievementResponse getUserAchievementById(Long id);

    UserAchievementResponse createUserAchievement(Long userId, Long achievementId, LocalDateTime unlockedAt);

    UserAchievementResponse updateUserAchievement(Long id, Long userId, Long achievementId, LocalDateTime unlockedAt);

    void deleteUserAchievement(Long id);

    List<UserAchievementResponse> getUserAchievements(Long userId);

    void updateAchievements(User user, Long workoutDayId);

    void refreshAchievementProgress(Achievement ach);
}
