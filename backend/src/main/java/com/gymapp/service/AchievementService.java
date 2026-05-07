package com.gymapp.service;

import com.gymapp.dto.request.AchievementRequest;
import com.gymapp.dto.response.AchievementResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface AchievementService {

    List<AchievementResponse> getAllAchievements();

    AchievementResponse getAchievementById(Long id);

    // 🔥 CREATE con imagen
    AchievementResponse createAchievement(AchievementRequest request, MultipartFile image) throws IOException;

    // 🔥 UPDATE con imagen + delete flag
    AchievementResponse updateAchievement(Long id,
            AchievementRequest request,
            MultipartFile image,
            Boolean deleteImage) throws IOException;

    // 🔥 DELETE con manejo de archivos
    void deleteAchievement(Long id) throws IOException;

    // 🔥 GET imagen
    ResponseEntity<Resource> getAchievementImage(String filename) throws IOException;
}