package com.gymapp.service;

import com.gymapp.dto.request.UserRequest;
import com.gymapp.dto.response.UserResponse;
import com.gymapp.dto.response.WorkoutResponse;
import com.gymapp.model.User;
import com.gymapp.model.Workout;
import com.gymapp.repository.UserRepository;
import com.gymapp.repository.WorkoutRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public UserResponse getUserById(Long id) {

        return toResponse(userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado")));
    }

    @Override
    public List<UserResponse> getLoggedUsers() {
        return userRepository.findByLogged(true).stream().map(this::toResponse).toList();
    }

    @Override
    public List<UserResponse> getNotLoggedUsers() {
        return userRepository.findByLogged(false).stream().map(this::toResponse).toList();
    }

    @Override
    public List<UserResponse> searchUsers(String query) {

        return userRepository
                .findByNameContainingIgnoreCaseOrSurnameContainingIgnoreCase(query, query)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public UserResponse createUser(UserRequest request) {

        try {
            User user = new User();
            user.setName(request.name());
            user.setSurname(request.surname());
            user.setGymDaysPerWeek(request.gymDaysPerWeek());
            return toResponse(userRepository.save(user));
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Ya existe un usuario con ese nombre y apellido");
        }
    }

    @Override
    public UserResponse updateUser(Long id, UserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setName(request.name());
        user.setSurname(request.surname());
        user.setGymDaysPerWeek(request.gymDaysPerWeek());

        return toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse loginUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setLogged(true);

        return toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse logoutUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setLogged(false);

        return toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse setCurrentWorkout(Long userId, Long workoutId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new RuntimeException("Workout no encontrado"));

        user.setCurrentWorkout(workout);

        return toResponse(userRepository.save(user));
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public WorkoutResponse getCurrentWorkout(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getCurrentWorkout() == null) {
            throw new RuntimeException("El usuario no tiene workout actual");
        }

        return toWorkoutResponse(user.getCurrentWorkout());
    }

    private UserResponse toResponse(User user) {
        Long currentWorkoutId = user.getCurrentWorkout() != null ? user.getCurrentWorkout().getId() : null;
        return new UserResponse(user.getId(), user.getName(), user.getSurname(), user.getLogged(),
                user.getGymDaysPerWeek(), currentWorkoutId);
    }

    private WorkoutResponse toWorkoutResponse(Workout workout) {
        Long userId = workout.getUser() != null ? workout.getUser().getId() : null;
        return new WorkoutResponse(workout.getId(), workout.getName(), workout.getReps(),
                workout.getStartDate(), workout.getEndDate(), userId);
    }

}