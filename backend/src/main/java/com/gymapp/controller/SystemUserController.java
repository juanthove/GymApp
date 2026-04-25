package com.gymapp.controller;

import com.gymapp.dto.request.LoginRequest;
import com.gymapp.dto.request.SystemUserRequest;
import com.gymapp.dto.response.SystemUserResponse;
import com.gymapp.service.SystemUserService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/system-users")
public class SystemUserController {

    @Autowired
    private SystemUserService service;

    @GetMapping
    public List<SystemUserResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public SystemUserResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public SystemUserResponse create(@Valid @RequestBody SystemUserRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public SystemUserResponse update(
            @PathVariable Long id,
            @RequestBody SystemUserRequest request
    ) {
        return service.update(id, request);
    }

    @PostMapping("/login")
    public SystemUserResponse login(@Valid @RequestBody LoginRequest request) {
        return service.login(request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}