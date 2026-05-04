package com.gymapp.repository;

import com.gymapp.model.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {

    List<Achievement> findByLevelIdGreaterThanEqual(Long levelId);

    @Query("""
        SELECT a
        FROM Achievement a
        WHERE a.type = 'STREAK'
        AND a.level.id >= :levelId
    """)
    List<Achievement> findAvailableStreakAchievements(Long levelId);
}