package com.gymapp.controller;

import com.gymapp.model.Exercise;
import com.gymapp.model.ExerciseType;
import com.gymapp.service.ExerciseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    @Autowired
    private ExerciseService exerciseService;

    @GetMapping
    public List<Exercise> getAllExercises() {
        return exerciseService.getAllExercises();
    }

    @GetMapping("/{id}")
    public Exercise getExerciseById(@PathVariable Long id) {
        return exerciseService.getExerciseById(id);
    }

    @PostMapping
    public Exercise createExercise(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("type") ExerciseType type,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "video", required = false) MultipartFile video
    ) throws IOException {
        return exerciseService.createExercise(name, description, type, image, video);
    }

    @PutMapping("/{id}")
    public Exercise updateExercise(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("type") ExerciseType type,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "video", required = false) MultipartFile video,
            @RequestParam(value = "deleteImage", required = false) Boolean deleteImage,
            @RequestParam(value = "deleteVideo", required = false) Boolean deleteVideo
    ) throws IOException {
        return exerciseService.updateExercise(id, name, description, type, image, video, deleteImage, deleteVideo);
    }

    @DeleteMapping("/{id}")
    public void deleteExercise(@PathVariable Long id) throws IOException {
        exerciseService.deleteExercise(id);
    }

    @GetMapping("/image/{filename}")
    public ResponseEntity<Resource> getExerciseImage(@PathVariable String filename) throws IOException {
        return exerciseService.getExerciseImage(filename);
    }

    @GetMapping("/video/{filename}")
    public ResponseEntity<Resource> getExerciseVideo(@PathVariable String filename) throws IOException {
        return exerciseService.getExerciseVideo(filename);
    }
}
