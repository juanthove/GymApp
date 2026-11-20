package com.gymapp.controller;

import com.gymapp.dto.request.UserExerciseRequest;
import com.gymapp.dto.response.UserExerciseResponse;
import com.gymapp.service.UserExerciseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-exercises")
@RequiredArgsConstructor
public class UserExerciseController {

    private final UserExerciseService userExerciseService;

    @GetMapping("/user/{userId}")
    public List<UserExerciseResponse> getUserExercises(
            @PathVariable Long userId) {

        return userExerciseService.getUserExercises(userId);
    }

    @PostMapping("/user/{userId}")
    public UserExerciseResponse createUserExercise(
            @PathVariable Long userId,
            @Valid @RequestBody UserExerciseRequest request) {

        return userExerciseService.createUserExercise(userId, request);
    }

    @PutMapping("/{id}")
    public UserExerciseResponse updateUserExercise(
            @PathVariable Long id,
            @Valid @RequestBody UserExerciseRequest request) {

        return userExerciseService.updateUserExercise(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteUserExercise(@PathVariable Long id) {
        userExerciseService.deleteUserExercise(id);
    }

    @PutMapping("/user/{userId}/exercises")
    public ResponseEntity<List<UserExerciseResponse>> saveUserExercises(
            @PathVariable Long userId,
            @RequestBody List<UserExerciseRequest> requests) {

        return ResponseEntity.ok(
                userExerciseService.saveUserExercises(userId, requests));
    }
}
