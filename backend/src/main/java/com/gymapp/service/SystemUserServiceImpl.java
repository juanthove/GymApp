package com.gymapp.service;

import com.gymapp.dto.request.LoginRequest;
import com.gymapp.dto.request.SystemUserRequest;
import com.gymapp.dto.response.LoginResponse;
import com.gymapp.dto.response.SystemUserResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.exception.ConflictException;
import com.gymapp.model.SystemUser;
import com.gymapp.repository.SystemUserRepository;
import com.gymapp.security.JwtService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SystemUserServiceImpl implements SystemUserService {

    @Autowired
    private SystemUserRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

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
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role());

        return toResponse(repository.save(user));
    }

    @Override
    public SystemUserResponse update(Long id, SystemUserRequest request) {

        SystemUser user = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SystemUser no encontrado"));

        // Validar username duplicado
        repository.findByUsername(request.username())
                .filter(u -> !u.getId().equals(id))
                .ifPresent(u -> {
                    throw new ConflictException("Username ya existe");
                });

        user.setUsername(request.username());
        user.setRole(request.role());

        // Solo actualiza password si viene
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        return toResponse(repository.save(user));
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        SystemUser user = repository.findByUsername(request.username())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (!passwordMatches(request.password(), user.getPassword())) {
            throw new ConflictException("Password incorrecta");
        }

        if (!isBcryptHash(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.password()));
            repository.save(user);
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                token,
                "Bearer",
                jwtService.getExpirationMillis());
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
                user.getRole());
    }

    private boolean passwordMatches(String rawPassword, String storedPassword) {
        if (isBcryptHash(storedPassword)) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }
        return rawPassword.equals(storedPassword);
    }

    private boolean isBcryptHash(String value) {
        return value != null && value.matches("^\\$2[aby]?\\$.{56}$");
    }
}