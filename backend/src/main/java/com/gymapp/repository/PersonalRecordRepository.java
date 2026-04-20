package com.gymapp.repository;

import com.gymapp.dto.response.PersonalRecordResponse;
import com.gymapp.model.PersonalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.List;

public interface PersonalRecordRepository extends JpaRepository<PersonalRecord, Long> {

    Optional<PersonalRecord> findByUserIdAndExerciseId(Long userId, Long exerciseId);

    List<PersonalRecord> findAllByUserId(Long userId);

    @Query("""
        SELECT new com.gymapp.dto.response.PersonalRecordResponse(
            pr.id,
            pr.user.id,
            ex.id,
            pr.weight,
            pr.date,
            ex.name,
            ex.muscle,
            ex.icon
        )
        FROM PersonalRecord pr
        JOIN pr.exercise ex
        WHERE pr.user.id = :userId
        ORDER BY pr.date DESC
    """)
    List<PersonalRecordResponse> findPRsWithExercise(Long userId);

}
