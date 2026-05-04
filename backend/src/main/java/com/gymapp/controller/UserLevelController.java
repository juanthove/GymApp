package com.gymapp.controller;

import com.gymapp.dto.request.UserLevelOrderRequest;
import com.gymapp.dto.request.UserLevelRequest;
import com.gymapp.dto.response.UserLevelResponse;
import com.gymapp.service.UserLevelService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-levels")
public class UserLevelController {

    @Autowired
    private UserLevelService userLevelService;

    @GetMapping
    public List<UserLevelResponse> getAll() {
        return userLevelService.getAllUserLevels();
    }

    @GetMapping("/{id}")
    public UserLevelResponse getById(@PathVariable Long id) {
        return userLevelService.getUserLevelById(id);
    }

    @PostMapping
    public UserLevelResponse create(@Valid @RequestBody UserLevelRequest request) {
        return userLevelService.createUserLevel(request);
    }

    @PutMapping("/{id}")
    public UserLevelResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UserLevelRequest request
    ) {
        return userLevelService.updateUserLevel(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        userLevelService.deleteUserLevel(id);
    }

    @PutMapping("/reorder")
    public void reorderUserLevels(@RequestBody List<UserLevelOrderRequest> levels) {
        userLevelService.updateUserLevelsOrder(levels);
    }
}