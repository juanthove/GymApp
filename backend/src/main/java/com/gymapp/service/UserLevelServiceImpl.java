package com.gymapp.service;

import com.gymapp.dto.request.UserLevelOrderRequest;
import com.gymapp.dto.request.UserLevelRequest;
import com.gymapp.dto.response.UserLevelResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.UserLevel;
import com.gymapp.repository.UserLevelRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Comparator;
import java.util.Map;

@Service
public class UserLevelServiceImpl implements UserLevelService {

    @Autowired
    private UserLevelRepository userLevelRepository;

    @Override
    public List<UserLevelResponse> getAllUserLevels() {
        return userLevelRepository.findAllByOrderByLevelOrderAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public UserLevelResponse getUserLevelById(Long id) {
        return toResponse(
                userLevelRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Nivel de usuario no encontrado"))
        );
    }

    @Override
    public UserLevelResponse createUserLevel(UserLevelRequest request) {
        int nextOrder = (int) userLevelRepository.count() + 1;

        UserLevel userLevel = new UserLevel();
        userLevel.setName(request.name());
        userLevel.setLevelOrder(nextOrder);

        return toResponse(userLevelRepository.save(userLevel));
    }

    @Override
    public UserLevelResponse updateUserLevel(Long id, UserLevelRequest request) {
        UserLevel userLevel = userLevelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nivel de usuario no encontrado"));

        userLevel.setName(request.name());

        return toResponse(userLevelRepository.save(userLevel));
    }

    @Override
    public void deleteUserLevel(Long id) {

        UserLevel toDelete = userLevelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nivel de usuario no encontrado"));

        userLevelRepository.delete(toDelete);

        // 🔥 Reordenar automáticamente
        List<UserLevel> levels = userLevelRepository.findAll()
                .stream()
                .sorted(Comparator.comparingInt(UserLevel::getLevelOrder))
                .toList();

        for (int i = 0; i < levels.size(); i++) {
            levels.get(i).setLevelOrder(i + 1);
        }

        userLevelRepository.saveAll(levels);
    }

    @Override
    public void updateUserLevelsOrder(List<UserLevelOrderRequest> levels) {

        // 1️⃣ Traer todos en una sola query
        List<Long> ids = levels.stream()
                .map(UserLevelOrderRequest::id)
                .toList();

        List<UserLevel> entities = userLevelRepository.findAllById(ids);

        // 2️⃣ Mapear id → order
        Map<Long, Integer> orderMap = levels.stream()
                .collect(Collectors.toMap(
                        UserLevelOrderRequest::id,
                        UserLevelOrderRequest::levelOrder
                ));

        // 3️⃣ Aplicar cambios en memoria
        for (UserLevel lvl : entities) {
            Integer newOrder = orderMap.get(lvl.getId());

            if (newOrder == null) {
                throw new RuntimeException("Falta levelOrder para id: " + lvl.getId());
            }

            lvl.setLevelOrder(newOrder);
        }

        // 4️⃣ Guardar todo junto
        userLevelRepository.saveAll(entities);
    }

    private UserLevelResponse toResponse(UserLevel userLevel) {
        return new UserLevelResponse(
                userLevel.getId(),
                userLevel.getName(),
                userLevel.getLevelOrder()
        );
    }
}