package com.gymapp.service;

import com.gymapp.dto.request.UserRequest;
import com.gymapp.dto.response.UserResponse;
import com.gymapp.dto.response.WorkoutResponse;
import com.gymapp.exception.ConflictException;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.User;
import com.gymapp.model.Workout;
import com.gymapp.repository.UserRepository;
import com.gymapp.repository.WorkoutRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    private final Path userImagePath = Paths.get("uploads/users");

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public UserResponse getUserById(Long id) {

        return toResponse(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado")));
    }

    @Override
    public List<UserResponse> getLoggedUsers() {
        return userRepository.findByLogged(true).stream().map(this::toResponse).toList();
    }

    @Override
    public List<UserResponse> getNotLoggedUsers() {
        return userRepository.findByLogged(false).stream().map(this::toResponse).toList();
    }

    @Override
    public List<UserResponse> searchUsers(String query) {

        return userRepository
                .findByNameContainingIgnoreCaseOrSurnameContainingIgnoreCase(query, query)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public UserResponse createUser(UserRequest request) {

        try {
            User user = new User();
            user.setName(request.name());
            user.setSurname(request.surname());
            user.setGymDaysPerWeek(request.gymDaysPerWeek());
            return toResponse(userRepository.save(user));
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("Ya existe un usuario con ese nombre y apellido");
        }
    }

    @Override
    public UserResponse updateUser(Long id, UserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        user.setName(request.name());
        user.setSurname(request.surname());
        user.setGymDaysPerWeek(request.gymDaysPerWeek());

        return toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse setUserImage(Long id, MultipartFile file) throws IOException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Files.createDirectories(userImagePath);

        if (user.getImage() != null) {
            Files.deleteIfExists(userImagePath.resolve(user.getImage()));
        }

        String original = file.getOriginalFilename();
        if (original == null || !original.contains(".")) {
            throw new RuntimeException("Archivo invalido");
        }

        String ext = original.substring(original.lastIndexOf("."));
        String fileName = UUID.randomUUID() + ext;

        Files.copy(file.getInputStream(), userImagePath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

        user.setImage(fileName);
        return toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse deleteUserImage(Long id) throws IOException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (user.getImage() != null) {
            Files.deleteIfExists(userImagePath.resolve(user.getImage()));
            user.setImage(null);
        }

        return toResponse(userRepository.save(user));
    }

    @Override
    public ResponseEntity<Resource> getUserImage(String filename) throws IOException {
        Path filePath = userImagePath.resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new ResourceNotFoundException("Imagen de usuario no encontrada");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, Files.probeContentType(filePath))
                .body(resource);
    }

    @Override
    public UserResponse loginUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        user.setLogged(true);

        return toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse logoutUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        user.setLogged(false);

        return toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse setCurrentWorkout(Long userId, Long workoutId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout no encontrado"));

        user.setCurrentWorkout(workout);

        return toResponse(userRepository.save(user));
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        try {
            if (user.getImage() != null) {
                Files.deleteIfExists(userImagePath.resolve(user.getImage()));
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        userRepository.deleteById(id);
    }

    @Override
    public WorkoutResponse getCurrentWorkout(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (user.getCurrentWorkout() == null) {
            throw new ResourceNotFoundException("El usuario no tiene workout actual");
        }

        return toWorkoutResponse(user.getCurrentWorkout());
    }

    private UserResponse toResponse(User user) {
        Long currentWorkoutId = user.getCurrentWorkout() != null ? user.getCurrentWorkout().getId() : null;
        return new UserResponse(user.getId(), user.getName(), user.getSurname(), user.getLogged(),
                user.getGymDaysPerWeek(), user.getImage(), currentWorkoutId);
    }

    private WorkoutResponse toWorkoutResponse(Workout workout) {
        Long userId = workout.getUser() != null ? workout.getUser().getId() : null;
        return new WorkoutResponse(workout.getId(), workout.getName(), workout.getReps(),
                workout.getStartDate(), workout.getEndDate(), userId);
    }

}