package com.gymapp.controller;

import com.gymapp.model.User;
import com.gymapp.model.Workout;
import com.gymapp.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping("/logged")
    public List<User> getLoggedUsers() {
        return userService.getLoggedUsers();
    }

    @GetMapping("/not-logged")
    public List<User> getNotLoggedUsers() {
        return userService.getNotLoggedUsers();
    }

    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam String query) {
        return userService.searchUsers(query);
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id,
                           @RequestBody User updatedUser) {

        return userService.updateUser(id, updatedUser);
    }

    @PatchMapping("/{id}/login")
    public User loginUser(@PathVariable Long id) {
        return userService.loginUser(id);
    }

    @PatchMapping("/{id}/logout")
    public User logoutUser(@PathVariable Long id) {
        return userService.logoutUser(id);
    }

    @PutMapping("/{userId}/current-workout/{workoutId}")
    public User setCurrentWorkout(@PathVariable Long userId,
                                  @PathVariable Long workoutId) {

        return userService.setCurrentWorkout(userId, workoutId);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @GetMapping("/{id}/current-workout")
    public Workout getCurrentWorkout(@PathVariable Long id) {
        return userService.getCurrentWorkout(id);
    }

}