package com.gymapp.repository;

import com.gymapp.model.Phrase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface PhraseRepository extends JpaRepository<Phrase, Long> {

    @Query(value = "SELECT * FROM phrase ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Optional<Phrase> getRandomPhrase();
}