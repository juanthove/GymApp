package com.gymapp.service;

import com.gymapp.model.Exercise;
import com.gymapp.model.ExerciseType;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ExerciseService {

    List<Exercise> getAllExercises();

    Exercise getExerciseById(Long id);

    Exercise createExercise(String name, String description, ExerciseType type,
                            MultipartFile image, MultipartFile video) throws IOException;

    Exercise updateExercise(Long id, String name, String description, ExerciseType type,
                            MultipartFile image, MultipartFile video,
                            Boolean deleteImage, Boolean deleteVideo) throws IOException;

    void deleteExercise(Long id) throws IOException;

    ResponseEntity<Resource> getExerciseImage(String filename) throws IOException;

    ResponseEntity<Resource> getExerciseVideo(String filename) throws IOException;
}
