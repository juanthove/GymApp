package com.gymapp.service;

import com.gymapp.dto.request.PhraseRequest;
import com.gymapp.dto.response.PhraseResponse;
import com.gymapp.exception.ConflictException;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.Phrase;
import com.gymapp.repository.PhraseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PhraseServiceImpl implements PhraseService {

    @Autowired
    private PhraseRepository phraseRepository;

    @Override
    public List<PhraseResponse> getAllPhrases() {
        return phraseRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public PhraseResponse getPhraseById(Long id) {
        return toResponse(
                phraseRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Frase no encontrada"))
        );
    }

    @Override
    public PhraseResponse createPhrase(PhraseRequest request) {
        Phrase phrase = new Phrase();
        phrase.setText(request.text());

        try {
            return toResponse(phraseRepository.save(phrase));
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("La frase ya existe");
        }
    }

    @Override
    public PhraseResponse updatePhrase(Long id, PhraseRequest request) {

        Phrase phrase = phraseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Frase no encontrada"));

        phrase.setText(request.text());

        try {
            return toResponse(phraseRepository.save(phrase));
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("La frase ya existe");
        }
    }

    @Override
    public void deletePhrase(Long id) {

        Phrase phrase = phraseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Frase no encontrada"));

        phraseRepository.delete(phrase);
    }

    @Override
    public PhraseResponse getRandomPhrase() {

        Phrase phrase = phraseRepository.getRandomPhrase()
                .orElseThrow(() -> new ResourceNotFoundException("No hay frases cargadas"));

        return toResponse(phrase);
    }

    private PhraseResponse toResponse(Phrase phrase) {
        return new PhraseResponse(phrase.getId(), phrase.getText());
    }

}