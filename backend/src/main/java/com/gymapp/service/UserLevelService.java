package com.gymapp.service;

import com.gymapp.dto.request.UserLevelOrderRequest;
import com.gymapp.dto.request.UserLevelRequest;
import com.gymapp.dto.response.UserLevelResponse;

import java.util.List;

public interface UserLevelService {

    List<UserLevelResponse> getAllUserLevels();

    UserLevelResponse getUserLevelById(Long id);

    UserLevelResponse createUserLevel(UserLevelRequest request);

    UserLevelResponse updateUserLevel(Long id, UserLevelRequest request);

    void deleteUserLevel(Long id);

    void updateUserLevelsOrder(List<UserLevelOrderRequest> levels);
}