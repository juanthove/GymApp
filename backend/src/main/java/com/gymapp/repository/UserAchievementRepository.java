package com.gymapp.repository;

import com.gymapp.model.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {

    List<UserAchievement> findByUserId(Long userId);

    List<UserAchievement> findByAchievementId(Long achievementId);

    @Query("""
                SELECT ua
                FROM UserAchievement ua
                JOIN FETCH ua.achievement a
                WHERE ua.user.id = :userId
                AND a.type = 'STREAK'
                AND ua.unlockedAt IS NULL
            """)
    List<UserAchievement> findActiveStreakByUserId(Long userId);
}
