package com.gymapp.controller;

import com.gymapp.dto.request.PhraseRequest;
import com.gymapp.dto.response.PhraseResponse;
import com.gymapp.service.PhraseService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/phrases")
public class PhraseController {

    @Autowired
    private PhraseService phraseService;

    @GetMapping
    public List<PhraseResponse> getAll() {
        return phraseService.getAllPhrases();
    }

    @GetMapping("/{id}")
    public PhraseResponse getById(@PathVariable Long id) {
        return phraseService.getPhraseById(id);
    }

    @PostMapping
    public PhraseResponse create(@Valid @RequestBody PhraseRequest request) {
        return phraseService.createPhrase(request);
    }

    @PutMapping("/{id}")
    public PhraseResponse update(
            @PathVariable Long id,
            @Valid @RequestBody PhraseRequest request) {
        return phraseService.updatePhrase(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        phraseService.deletePhrase(id);
    }

    @GetMapping("/random")
    public PhraseResponse getRandom() {
        return phraseService.getRandomPhrase();
    }
}