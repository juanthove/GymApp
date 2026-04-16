package com.gymapp.repository;

import com.gymapp.model.PersonalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PersonalRecordRepository extends JpaRepository<PersonalRecord, Long> {

    Optional<PersonalRecord> findByUserIdAndExerciseId(Long userId, Long exerciseId);

}
