package com.gymapp.controller;

import com.gymapp.dto.request.UserRequest;
import com.gymapp.dto.response.UserResponse;
import com.gymapp.dto.response.WorkoutResponse;
import com.gymapp.service.UserService;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping("/logged")
    public List<UserResponse> getLoggedUsers() {
        return userService.getLoggedUsers();
    }

    @GetMapping("/not-logged")
    public List<UserResponse> getNotLoggedUsers() {
        return userService.getNotLoggedUsers();
    }

    @GetMapping("/search")
    public List<UserResponse> searchUsers(@RequestParam String query) {
        return userService.searchUsers(query);
    }

    @PostMapping
    public UserResponse createUser(@Valid @RequestBody UserRequest request) {
        return userService.createUser(request);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable Long id,
                           @Valid @RequestBody UserRequest request) {

        return userService.updateUser(id, request);
    }

    @PostMapping("/{id}/image")
    public UserResponse uploadUserImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image) throws IOException {
        return userService.setUserImage(id, image);
    }

    @DeleteMapping("/{id}/image")
    public UserResponse deleteUserImage(@PathVariable Long id) throws IOException {
        return userService.deleteUserImage(id);
    }

    @GetMapping("/image/{filename}")
    public ResponseEntity<Resource> getUserImage(@PathVariable String filename) throws IOException {
        return userService.getUserImage(filename);
    }

    @PatchMapping("/{id}/login")
    public UserResponse loginUser(@PathVariable Long id) {
        return userService.loginUser(id);
    }

    @PatchMapping("/{id}/logout")
    public UserResponse logoutUser(@PathVariable Long id) {
        return userService.logoutUser(id);
    }

    @PutMapping("/{userId}/current-workout/{workoutId}")
    public UserResponse setCurrentWorkout(@PathVariable Long userId,
                                  @PathVariable Long workoutId) {

        return userService.setCurrentWorkout(userId, workoutId);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @GetMapping("/{id}/current-workout")
    public WorkoutResponse getCurrentWorkout(@PathVariable Long id) {
        return userService.getCurrentWorkout(id);
    }

}