package com.gymapp.controller;

import com.gymapp.dto.request.AchievementRequest;
import com.gymapp.dto.response.AchievementResponse;
import com.gymapp.service.AchievementService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {

    @Autowired
    private AchievementService achievementService;

    @GetMapping
    public List<AchievementResponse> getAll() {
        return achievementService.getAllAchievements();
    }

    @GetMapping("/{id}")
    public AchievementResponse getById(@PathVariable Long id) {
        return achievementService.getAchievementById(id);
    }

    @PostMapping
    public AchievementResponse create(@Valid @RequestBody AchievementRequest request) {
        return achievementService.createAchievement(request);
    }

    @PutMapping("/{id}")
    public AchievementResponse update(
            @PathVariable Long id,
            @Valid @RequestBody AchievementRequest request
    ) {
        return achievementService.updateAchievement(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        achievementService.deleteAchievement(id);
    }
}