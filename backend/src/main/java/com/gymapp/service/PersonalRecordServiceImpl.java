package com.gymapp.service;

import com.gymapp.dto.request.PersonalRecordRequest;
import com.gymapp.dto.response.PersonalRecordResponse;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.model.Exercise;
import com.gymapp.model.PersonalRecord;
import com.gymapp.model.User;
import com.gymapp.repository.ExerciseRepository;
import com.gymapp.repository.PersonalRecordRepository;
import com.gymapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PersonalRecordServiceImpl implements PersonalRecordService {

    @Autowired
    private PersonalRecordRepository personalRecordRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Override
    public List<PersonalRecordResponse> getAllPersonalRecords() {
        return personalRecordRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public PersonalRecordResponse getPersonalRecordById(Long id) {
        return toResponse(personalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PersonalRecord no encontrado")));
    }

    @Override
    public PersonalRecordResponse createPersonalRecord(PersonalRecordRequest request) {
        PersonalRecord personalRecord = new PersonalRecord();
        personalRecord.setUser(findUser(request.userId()));
        personalRecord.setExercise(findExercise(request.exerciseId()));
        personalRecord.setWeight(request.weight());
        personalRecord.setDate(LocalDateTime.now());
        return toResponse(personalRecordRepository.save(personalRecord));
    }

    @Override
    public PersonalRecordResponse updatePersonalRecord(Long id, PersonalRecordRequest request) {
        PersonalRecord personalRecord = personalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PersonalRecord no encontrado"));
        personalRecord.setUser(findUser(request.userId()));
        personalRecord.setExercise(findExercise(request.exerciseId()));
        personalRecord.setWeight(request.weight());
        personalRecord.setDate(LocalDateTime.now());
        return toResponse(personalRecordRepository.save(personalRecord));
    }

    @Override
    public void deletePersonalRecord(Long id) {
        if (!personalRecordRepository.existsById(id)) {
            throw new ResourceNotFoundException("PersonalRecord no encontrado");
        }
        personalRecordRepository.deleteById(id);
    }

    @Override
    public PersonalRecordResponse updateIfGreater(Long userId, Long exerciseId, Long weight) {
        if (weight == null || weight <= 0) {
            throw new IllegalArgumentException("El peso debe ser un número positivo");
        }

        User user = findUser(userId);
        Exercise exercise = findExercise(exerciseId);

        PersonalRecord personalRecord = personalRecordRepository
                .findByUserIdAndExerciseId(userId, exerciseId)
                .orElseGet(() -> {
                    PersonalRecord newRecord = new PersonalRecord();
                    newRecord.setUser(user);
                    newRecord.setExercise(exercise);
                    return newRecord;
                });

        if (personalRecord.getId() == null || personalRecord.getWeight() == null || weight > personalRecord.getWeight()) {
            personalRecord.setWeight(weight);
            personalRecord.setDate(LocalDateTime.now());
            personalRecord = personalRecordRepository.save(personalRecord);
        }

        return toResponse(personalRecord);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private Exercise findExercise(Long exerciseId) {
        return exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Ejercicio no encontrado"));
    }

    private PersonalRecordResponse toResponse(PersonalRecord personalRecord) {
        return new PersonalRecordResponse(
                personalRecord.getId(),
                personalRecord.getUser() != null ? personalRecord.getUser().getId() : null,
                personalRecord.getExercise() != null ? personalRecord.getExercise().getId() : null,
                personalRecord.getWeight(),
                personalRecord.getDate()
        );
    }
}
