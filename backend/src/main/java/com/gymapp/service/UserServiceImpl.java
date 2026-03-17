package com.gymapp.service;

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
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @Override
    public List<User> getLoggedUsers() {
        return userRepository.findByLogged(true);
    }

    @Override
    public List<User> getNotLoggedUsers() {
        return userRepository.findByLogged(false);
    }

    @Override
    public List<User> searchUsers(String query) {

        return userRepository
                .findByNameContainingIgnoreCaseOrSurnameContainingIgnoreCase(query, query);
    }

    @Override
    public User createUser(User user) {

        try {
            return userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Ya existe un usuario con ese nombre y apellido");
        }
    }

    @Override
    public User updateUser(Long id, User updatedUser) {

        return userRepository.findById(id).map(user -> {

            user.setName(updatedUser.getName());
            user.setSurname(updatedUser.getSurname());
            user.setGymDaysPerWeek(updatedUser.getGymDaysPerWeek());

            return userRepository.save(user);

        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @Override
    public User loginUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setLogged(true);

        return userRepository.save(user);
    }

    @Override
    public User logoutUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setLogged(false);

        return userRepository.save(user);
    }

    @Override
    public User setCurrentWorkout(Long userId, Long workoutId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new RuntimeException("Workout no encontrado"));

        user.setCurrentWorkout(workout);

        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public Workout getCurrentWorkout(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getCurrentWorkout() == null) {
            throw new RuntimeException("El usuario no tiene workout actual");
        }

        return user.getCurrentWorkout();
    }

}