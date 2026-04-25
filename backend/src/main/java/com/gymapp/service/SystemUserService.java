package com.gymapp.service;

import com.gymapp.dto.request.LoginRequest;
import com.gymapp.dto.request.SystemUserRequest;
import com.gymapp.dto.response.SystemUserResponse;

import java.util.List;

public interface SystemUserService {

    List<SystemUserResponse> getAll();

    SystemUserResponse getById(Long id);

    SystemUserResponse create(SystemUserRequest request);

    SystemUserResponse update(Long id, SystemUserRequest request);

    SystemUserResponse login(LoginRequest request);

    void delete(Long id);
}