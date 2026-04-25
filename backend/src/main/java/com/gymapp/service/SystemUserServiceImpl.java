package com.gymapp.service;

import com.gymapp.dto.request.LoginRequest;
import com.gymapp.dto.request.SystemUserRequest;
import com.gymapp.dto.response.SystemUserResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.exception.ConflictException;
import com.gymapp.model.SystemUser;
import com.gymapp.repository.SystemUserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SystemUserServiceImpl implements SystemUserService {

    @Autowired
    private SystemUserRepository repository;

    @Override
    public List<SystemUserResponse> getAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public SystemUserResponse getById(Long id) {
        return toResponse(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SystemUser no encontrado")));
    }

    @Override
    public SystemUserResponse create(SystemUserRequest request) {

        if (repository.findByUsername(request.username()).isPresent()) {
            throw new ConflictException("Username ya existe");
        }

        SystemUser user = new SystemUser();
        user.setUsername(request.username());
        user.setPassword(request.password()); // ⚠️ después podés encriptar
        user.setRole(request.role());

        return toResponse(repository.save(user));
    }

    @Override
    public SystemUserResponse update(Long id, SystemUserRequest request) {

        SystemUser user = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SystemUser no encontrado"));

        // 🔥 validar username duplicado
        repository.findByUsername(request.username())
                .filter(u -> !u.getId().equals(id))
                .ifPresent(u -> {
                    throw new ConflictException("Username ya existe");
                });

        user.setUsername(request.username());
        user.setRole(request.role());

        // 🔐 solo actualiza password si viene
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(request.password());
        }

        return toResponse(repository.save(user));
    }

    @Override
    public SystemUserResponse login(LoginRequest request) {

        SystemUser user = repository.findByUsername(request.username())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (!user.getPassword().equals(request.password())) {
            throw new ConflictException("Password incorrecta");
        }

        return toResponse(user);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("SystemUser no encontrado");
        }
        repository.deleteById(id);
    }

    private SystemUserResponse toResponse(SystemUser user) {
        return new SystemUserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole()
        );
    }
}