package com.gymapp.service;

import com.gymapp.dto.request.PersonalRecordRequest;
import com.gymapp.dto.response.PersonalRecordResponse;

import java.util.List;

public interface PersonalRecordService {

    List<PersonalRecordResponse> getAllPersonalRecords();

    PersonalRecordResponse getPersonalRecordById(Long id);

    PersonalRecordResponse createPersonalRecord(PersonalRecordRequest request);

    List<PersonalRecordResponse> getPersonalRecordsByUser(Long userId);

    PersonalRecordResponse updatePersonalRecord(Long id, PersonalRecordRequest request);

    void deletePersonalRecord(Long id);

    PersonalRecordResponse updateIfGreater(Long userId, Long exerciseId, Long weight);
}
