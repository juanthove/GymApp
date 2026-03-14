package com.gymapp.controller;

import com.gymapp.model.Exercise;
import com.gymapp.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    @Autowired
    private ExerciseRepository exerciseRepository;

    private final Path imagePath = Paths.get("uploads/images");
    private final Path videoPath = Paths.get("uploads/videos");

    // Obtener todos
    @GetMapping
    public List<Exercise> getAllExercises() {
        return exerciseRepository.findAll();
    }

    // Obtener por id
    @GetMapping("/{id}")
    public Exercise getExerciseById(@PathVariable Long id) {
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
    }

    // Crear ejercicio
    @PostMapping
    public Exercise createExercise(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "video", required = false) MultipartFile video
    ) throws IOException {

        Exercise exercise = new Exercise();
        exercise.setName(name);
        exercise.setDescription(description);

        saveFiles(exercise, name, image, video);

        return exerciseRepository.save(exercise);
    }

    // Actualizar ejercicio
    @PutMapping("/{id}")
    public Exercise updateExercise(

            @PathVariable Long id,

            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,

            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "video", required = false) MultipartFile video,

            @RequestParam(value = "deleteImage", required = false) Boolean deleteImage,
            @RequestParam(value = "deleteVideo", required = false) Boolean deleteVideo

    ) throws IOException {

        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        String oldName = exercise.getName();
        String newSafeName = name.toLowerCase().replace(" ", "_");

        exercise.setName(name);
        exercise.setDescription(description);

        Files.createDirectories(imagePath);
        Files.createDirectories(videoPath);

        /*
        DELETE IMAGE
        */
        if(Boolean.TRUE.equals(deleteImage) && exercise.getImage()!=null){

            Path file = Paths.get("uploads").resolve(exercise.getImage());

            Files.deleteIfExists(file);

            exercise.setImage(null);
        }

        /*
        DELETE VIDEO
        */
        if(Boolean.TRUE.equals(deleteVideo) && exercise.getVideo()!=null){

            Path file = Paths.get("uploads").resolve(exercise.getVideo());

            Files.deleteIfExists(file);

            exercise.setVideo(null);
        }

        /*
        UPDATE IMAGE
        */
        if(image!=null && !image.isEmpty()){

            if(exercise.getImage()!=null){

                Path old = Paths.get("uploads").resolve(exercise.getImage());
                Files.deleteIfExists(old);
            }

            String extension = getExtension(image.getOriginalFilename());

            String fileName = newSafeName + "." + extension;

            Path filePath = imagePath.resolve(fileName);

            Files.write(filePath,image.getBytes());

            exercise.setImage(fileName);
        }

        /*
        UPDATE VIDEO
        */
        if(video!=null && !video.isEmpty()){

            if(exercise.getVideo()!=null){

                Path old = Paths.get("uploads").resolve(exercise.getVideo());
                Files.deleteIfExists(old);
            }

            String extension = getExtension(video.getOriginalFilename());

            String fileName = newSafeName + "." + extension;

            Path filePath = videoPath.resolve(fileName);

            Files.write(filePath,video.getBytes());

            exercise.setVideo(fileName);
        }

        /*
        RENAME FILES IF NAME CHANGED
        */
        if(!oldName.equals(name)){

            String oldSafeName = oldName.toLowerCase().replace(" ","_");

            if(exercise.getImage()!=null){

                String ext = getExtension(exercise.getImage());

                Path oldFile = imagePath.resolve(oldSafeName+"."+ext);
                Path newFile = imagePath.resolve(newSafeName+"."+ext);

                if(Files.exists(oldFile))
                    Files.move(oldFile,newFile,StandardCopyOption.REPLACE_EXISTING);

                exercise.setImage(newSafeName+"."+ext);
            }

            if(exercise.getVideo()!=null){

                String ext = getExtension(exercise.getVideo());

                Path oldFile = videoPath.resolve(oldSafeName+"."+ext);
                Path newFile = videoPath.resolve(newSafeName+"."+ext);

                if(Files.exists(oldFile))
                    Files.move(oldFile,newFile,StandardCopyOption.REPLACE_EXISTING);

                exercise.setVideo(newSafeName+"."+ext);
            }
        }

        return exerciseRepository.save(exercise);
    }

    // Eliminar ejercicio
    @DeleteMapping("/{id}")
    public void deleteExercise(@PathVariable Long id) throws IOException {

        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));

        if (exercise.getImage() != null) {
            Files.deleteIfExists(Paths.get("uploads/" + exercise.getImage()));
        }

        if (exercise.getVideo() != null) {
            Files.deleteIfExists(Paths.get("uploads/" + exercise.getVideo()));
        }

        exerciseRepository.deleteById(id);
    }

    private void saveFiles(Exercise exercise, String name, MultipartFile image, MultipartFile video) throws IOException {

        String safeName = name.toLowerCase().replace(" ", "_");

        Files.createDirectories(imagePath);
        Files.createDirectories(videoPath);

        if (image != null && !image.isEmpty()) {

            String extension = getExtension(image.getOriginalFilename());
            String fileName = safeName + "." + extension;

            Path filePath = imagePath.resolve(fileName);

            Files.write(filePath, image.getBytes());

            exercise.setImage(fileName);
        }

        if (video != null && !video.isEmpty()) {

            String extension = getExtension(video.getOriginalFilename());
            String fileName = safeName + "." + extension;

            Path filePath = videoPath.resolve(fileName);

            Files.write(filePath, video.getBytes());

            exercise.setVideo(fileName);
        }
    }

    private String getExtension(String fileName) {
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }

    //Obtener imagen de un ejercicio
    @GetMapping("/image/{filename}")
    public ResponseEntity<Resource> getExerciseImage(@PathVariable String filename) throws IOException {
        Path filePath = imagePath.resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if(!resource.exists()) throw new RuntimeException("Imagen no encontrada");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, Files.probeContentType(filePath))
                .body(resource);
    }

    //Obtener video de un ejercicio
    @GetMapping("/video/{filename}")
    public ResponseEntity<Resource> getExerciseVideo(@PathVariable String filename) throws IOException {
        Path filePath = videoPath.resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if(!resource.exists()) throw new RuntimeException("Video no encontrado");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, Files.probeContentType(filePath))
                .body(resource);
    }

}