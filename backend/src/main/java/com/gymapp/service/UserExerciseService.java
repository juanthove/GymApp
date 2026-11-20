package com.gymapp.service;

import com.gymapp.dto.request.UserExerciseRequest;
import com.gymapp.dto.response.UserExerciseResponse;

import java.util.List;

public interface UserExerciseService {

    List<UserExerciseResponse> getUserExercises(Long userId);

    UserExerciseResponse createUserExercise(
            Long userId,
            UserExerciseRequest request);

    UserExerciseResponse updateUserExercise(
            Long id,
            UserExerciseRequest request);

    void deleteUserExercise(Long id);

    List<UserExerciseResponse> saveUserExercises(Long userId, List<UserExerciseRequest> requests);
}
