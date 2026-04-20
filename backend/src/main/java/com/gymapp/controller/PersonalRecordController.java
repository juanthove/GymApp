package com.gymapp.controller;

import com.gymapp.dto.request.PersonalRecordRequest;
import com.gymapp.dto.response.PersonalRecordResponse;
import com.gymapp.service.PersonalRecordService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/personal-records")
public class PersonalRecordController {

    @Autowired
    private PersonalRecordService personalRecordService;

    @GetMapping
    public List<PersonalRecordResponse> getAllPersonalRecords() {
        return personalRecordService.getAllPersonalRecords();
    }

    @GetMapping("/user/{userId}")
    public List<PersonalRecordResponse> getPersonalRecordsByUser(@PathVariable Long userId) {
        return personalRecordService.getPersonalRecordsByUser(userId);
    }

    @GetMapping("/{id}")
    public PersonalRecordResponse getPersonalRecordById(@PathVariable Long id) {
        return personalRecordService.getPersonalRecordById(id);
    }

    @PostMapping
    public PersonalRecordResponse createPersonalRecord(@RequestBody @Valid PersonalRecordRequest request) {
        return personalRecordService.createPersonalRecord(request);
    }

    @PutMapping("/{id}")
    public PersonalRecordResponse updatePersonalRecord(@PathVariable Long id,
                                                       @RequestBody @Valid PersonalRecordRequest request) {
        return personalRecordService.updatePersonalRecord(id, request);
    }

    @DeleteMapping("/{id}")
    public void deletePersonalRecord(@PathVariable Long id) {
        personalRecordService.deletePersonalRecord(id);
    }

    @PostMapping("/check")
    public PersonalRecordResponse checkAndUpdatePersonalRecord(@RequestBody @Valid PersonalRecordRequest request) {
        return personalRecordService.updateIfGreater(request.userId(), request.exerciseId(), request.weight());
    }
}
