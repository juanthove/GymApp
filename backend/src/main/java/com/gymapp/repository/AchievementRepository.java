package com.gymapp.repository;

import com.gymapp.model.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {

    List<Achievement> findByLevelLevelOrderGreaterThanEqual(Integer levelOrder);

    @Query("""
                SELECT a
                FROM Achievement a
                WHERE a.type = 'STREAK'
                AND a.level.levelOrder >= :levelOrder
            """)
    List<Achievement> findAvailableStreakAchievements(Integer levelOrder);
}