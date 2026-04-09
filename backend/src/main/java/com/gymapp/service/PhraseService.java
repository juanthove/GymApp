package com.gymapp.service;

import com.gymapp.dto.request.PhraseRequest;
import com.gymapp.dto.response.PhraseResponse;

import java.util.List;

public interface PhraseService {

    List<PhraseResponse> getAllPhrases();

    PhraseResponse getPhraseById(Long id);

    PhraseResponse createPhrase(PhraseRequest request);

    PhraseResponse updatePhrase(Long id, PhraseRequest request);

    void deletePhrase(Long id);

    PhraseResponse getRandomPhrase();
}