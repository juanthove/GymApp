
package com.gymapp.service;

import com.gymapp.dto.request.UserExerciseRequest;
import com.gymapp.dto.response.UserExerciseResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.Exercise;
import com.gymapp.model.User;
import com.gymapp.model.UserExercise;
import com.gymapp.repository.ExerciseRepository;
import com.gymapp.repository.UserExerciseRepository;
import com.gymapp.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserExerciseServiceImpl implements UserExerciseService {

    private final UserExerciseRepository userExerciseRepository;
    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserExerciseResponse> getUserExercises(Long userId) {

        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<Exercise> exercises = exerciseRepository.findAllByOrder();

        Map<Long, UserExercise> userExercises = userExerciseRepository
                .findByUserId(userId)
                .stream()
                .collect(Collectors.toMap(
                        ue -> ue.getExercise().getId(),
                        Function.identity()));

        return exercises.stream()
                .map(exercise -> {

                    UserExercise userExercise = userExercises.get(exercise.getId());

                    return new UserExerciseResponse(
                            userExercise != null ? userExercise.getId() : null,
                            exercise.getId(),
                            exercise.getName(),
                            exercise.getMuscle() != null
                                    ? exercise.getMuscle().toString()
                                    : null,
                            userExercise != null
                                    ? userExercise.getWeight()
                                    : null);
                })
                .toList();
    }

    @Override
    @Transactional
    public UserExerciseResponse createUserExercise(
            Long userId,
            UserExerciseRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Exercise exercise = exerciseRepository.findById(request.exerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("Ejercicio no encontrado"));

        if (userExerciseRepository.existsByUserIdAndExerciseId(
                userId, request.exerciseId())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El usuario ya tiene asignado este ejercicio");
        }

        UserExercise userExercise = new UserExercise();

        userExercise.setUser(user);
        userExercise.setExercise(exercise);
        userExercise.setWeight(request.weight());

        userExercise = userExerciseRepository.save(userExercise);

        return toResponse(userExercise);
    }

    @Override
    @Transactional
    public UserExerciseResponse updateUserExercise(
            Long id,
            UserExerciseRequest request) {

        UserExercise userExercise = userExerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ejercicio del usuario no encontrado"));

        userExercise.setWeight(request.weight());

        userExercise = userExerciseRepository.save(userExercise);

        return toResponse(userExercise);
    }

    @Override
    @Transactional
    public void deleteUserExercise(Long id) {

        UserExercise userExercise = userExerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ejercicio del usuario no encontrado"));

        userExerciseRepository.delete(userExercise);
    }

    @Transactional
    @Override
    public List<UserExerciseResponse> saveUserExercises(
            Long userId,
            List<UserExerciseRequest> requests) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<UserExercise> existingExercises = userExerciseRepository
                .findByUserId(userId);

        Map<Long, UserExercise> exercisesMap = new HashMap<>();

        for (UserExercise userExercise : existingExercises) {
            exercisesMap.put(userExercise.getExercise().getId(), userExercise);
        }

        List<UserExercise> exercisesToSave = new ArrayList<>();

        for (UserExerciseRequest request : requests) {

            UserExercise userExercise = exercisesMap.get(request.exerciseId());

            if (userExercise == null) {
                Exercise exercise = exerciseRepository.findById(request.exerciseId())
                        .orElseThrow(() -> new ResourceNotFoundException("Ejercicio no encontrado"));

                userExercise = new UserExercise();
                userExercise.setUser(user);
                userExercise.setExercise(exercise);
            }

            userExercise.setWeight(request.weight());

            exercisesToSave.add(userExercise);

            exercisesMap.put(request.exerciseId(), userExercise);
        }

        List<UserExercise> savedExercises = userExerciseRepository.saveAll(exercisesToSave);

        return savedExercises.stream()
                .map(this::toResponse)
                .toList();
    }

    private UserExerciseResponse toResponse(UserExercise userExercise) {

        Exercise exercise = userExercise.getExercise();

        return new UserExerciseResponse(
                userExercise.getId(),
                exercise.getId(),
                exercise.getName(),
                exercise.getMuscle() != null
                        ? exercise.getMuscle().toString()
                        : null,
                userExercise.getWeight());
    }
}
