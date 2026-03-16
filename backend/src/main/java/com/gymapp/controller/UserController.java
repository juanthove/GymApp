package com.gymapp.controller;

import com.gymapp.model.User;
import com.gymapp.model.Workout;
import com.gymapp.repository.UserRepository;
import com.gymapp.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    // Obtener todos
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Obtener usuario por id
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // Usuarios logueados
    @GetMapping("/logged")
    public List<User> getLoggedUsers() {
        return userRepository.findByLogged(true);
    }

    // Usuarios no logueados
    @GetMapping("/not-logged")
    public List<User> getNotLoggedUsers() {
        return userRepository.findByLogged(false);
    }

    // Buscar usuarios
    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam String query) {
        return userRepository
                .findByNameContainingIgnoreCaseOrSurnameContainingIgnoreCase(query, query);
    }

    // Crear usuario

    //Error al crear usuario con mismo nombre y apellido
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            return ResponseEntity.ok(userRepository.save(user));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Ya existe un usuario con ese nombre y apellido");
        }
    }

    // Actualizar usuario
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User updatedUser) {

        return userRepository.findById(id).map(user -> {

            user.setName(updatedUser.getName());
            user.setSurname(updatedUser.getSurname());
            user.setGymDaysPerWeek(updatedUser.getGymDaysPerWeek());

            return userRepository.save(user);

        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // Login
    @PatchMapping("/{id}/login")
    public User loginUser(@PathVariable Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setLogged(true);

        return userRepository.save(user);
    }

    // Logout
    @PatchMapping("/{id}/logout")
    public User logoutUser(@PathVariable Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setLogged(false);

        return userRepository.save(user);
    }

    // Cambiar workout actual
    @PutMapping("/{userId}/current-workout/{workoutId}")
    public User setCurrentWorkout(@PathVariable Long userId,
                                  @PathVariable Long workoutId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new RuntimeException("Workout no encontrado"));

        user.setCurrentWorkout(workout);

        return userRepository.save(user);
    }

    // Eliminar usuario
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
    }

    // Obtener workout actual
    @GetMapping("/{id}/current-workout")
    public Workout getCurrentWorkout(@PathVariable Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getCurrentWorkout() == null) {
            throw new RuntimeException("El usuario no tiene workout actual");
        }

        return user.getCurrentWorkout();
    }
}