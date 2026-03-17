package com.gymapp.service;

import com.gymapp.model.User;
import com.gymapp.model.Workout;

import java.util.List;

public interface UserService {

    List<User> getAllUsers();

    User getUserById(Long id);

    List<User> getLoggedUsers();

    List<User> getNotLoggedUsers();

    List<User> searchUsers(String query);

    User createUser(User user);

    User updateUser(Long id, User updatedUser);

    User loginUser(Long id);

    User logoutUser(Long id);

    User setCurrentWorkout(Long userId, Long workoutId);

    void deleteUser(Long id);

    Workout getCurrentWorkout(Long id);

}