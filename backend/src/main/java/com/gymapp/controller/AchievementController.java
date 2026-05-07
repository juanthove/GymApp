package com.gymapp.controller;

import com.gymapp.dto.request.AchievementRequest;
import com.gymapp.dto.response.AchievementResponse;
import com.gymapp.service.AchievementService;

import com.gymapp.model.AchievementType;
import com.gymapp.model.MuscleType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
    public AchievementResponse create(
            @RequestParam("name") String name,
            @RequestParam("type") AchievementType type,
            @RequestParam("levelId") Long levelId,
            @RequestParam("requiredValue") Double requiredValue,
            @RequestParam(value = "muscle", required = false) MuscleType muscle,
            @RequestParam(value = "exerciseId", required = false) Long exerciseId,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

        AchievementRequest request = new AchievementRequest(
                name,
                type,
                levelId,
                requiredValue,
                muscle,
                exerciseId);

        return achievementService.createAchievement(request, image);
    }

    @PutMapping("/{id}")
    public AchievementResponse update(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("type") AchievementType type,
            @RequestParam("levelId") Long levelId,
            @RequestParam("requiredValue") Double requiredValue,
            @RequestParam(value = "muscle", required = false) MuscleType muscle,
            @RequestParam(value = "exerciseId", required = false) Long exerciseId,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "deleteImage", required = false) Boolean deleteImage) throws IOException {

        AchievementRequest request = new AchievementRequest(
                name,
                type,
                levelId,
                requiredValue,
                muscle,
                exerciseId);

        return achievementService.updateAchievement(id, request, image, deleteImage);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) throws IOException {
        achievementService.deleteAchievement(id);
    }

    @GetMapping("/image/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) throws IOException {
        return achievementService.getAchievementImage(filename);
    }
}