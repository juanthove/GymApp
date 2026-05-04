package com.gymapp.service;

import com.gymapp.model.User;
import com.gymapp.dto.request.UserRequest;
import com.gymapp.dto.response.UserResponse;
import com.gymapp.dto.response.WorkoutResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

public interface UserService {

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    List<UserResponse> getLoggedUsers();

    List<UserResponse> getNotLoggedUsers();

    List<UserResponse> searchUsers(String query);

    UserResponse createUser(UserRequest request);

    UserResponse updateUser(Long id, UserRequest request);

    UserResponse setUserImage(Long id, MultipartFile file) throws IOException;

    UserResponse deleteUserImage(Long id) throws IOException;

    ResponseEntity<Resource> getUserImage(String filename) throws IOException;

    UserResponse loginUser(Long id);

    UserResponse logoutUser(Long id);

    UserResponse setCurrentWorkout(Long userId, Long workoutId);

    void deleteUser(Long id);

    WorkoutResponse getCurrentWorkout(Long id);

    void updateUserStats(User user, LocalDate workoutDate);

    void updateUserStreakState(User user);

}