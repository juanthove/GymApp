package com.gymapp.service;

import com.gymapp.dto.request.UserRequest;
import com.gymapp.dto.response.UserResponse;
import com.gymapp.dto.response.WorkoutResponse;

import java.util.List;

public interface UserService {

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    List<UserResponse> getLoggedUsers();

    List<UserResponse> getNotLoggedUsers();

    List<UserResponse> searchUsers(String query);

    UserResponse createUser(UserRequest request);

    UserResponse updateUser(Long id, UserRequest request);

    UserResponse loginUser(Long id);

    UserResponse logoutUser(Long id);

    UserResponse setCurrentWorkout(Long userId, Long workoutId);

    void deleteUser(Long id);

    WorkoutResponse getCurrentWorkout(Long id);

}