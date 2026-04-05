package com.gymapp.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;

@Service
public class SelectedWorkoutExerciseService {

    private static final String SELECTED_DIR = "selected-exercises";

    private final ObjectMapper objectMapper;

    public SelectedWorkoutExerciseService() {
        this.objectMapper = new ObjectMapper();
    }

    public void markSelected(Long workoutDayId, Long workoutExerciseId) {
        if (workoutDayId == null || workoutExerciseId == null) {
            throw new IllegalArgumentException("Day id and exercise id are required");
        }

        List<Long> selected = new ArrayList<>(readSelectedIds(workoutDayId));
        if (!selected.contains(workoutExerciseId)) {
            selected.add(workoutExerciseId); // 👈 se agrega al final
            writeSelectedIds(workoutDayId, selected);
        }
    }

    public void unmarkSelected(Long workoutDayId, Long workoutExerciseId) {
        if (workoutDayId == null || workoutExerciseId == null) {
            throw new IllegalArgumentException("Day id and exercise id are required");
        }

        List<Long> selected = new ArrayList<>(readSelectedIds(workoutDayId));
        if (selected.remove(workoutExerciseId)) {
            writeSelectedIds(workoutDayId, selected);
        }
    }

    public boolean isSelected(Long workoutDayId, Long workoutExerciseId) {
        if (workoutDayId == null || workoutExerciseId == null) {
            return false;
        }
        return readSelectedIds(workoutDayId).contains(workoutExerciseId);
    }

    public void deleteSelectedFile(Long workoutDayId) {
        if (workoutDayId == null) {
            throw new IllegalArgumentException("Day id is required");
        }
        Path target = selectedFilePath(workoutDayId);
        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete selected-file for workoutDay " + workoutDayId, e);
        }
    }

    public List<Long> getSelectedIds(Long workoutDayId) {
        return readSelectedIds(workoutDayId);
    }

    private Path selectedDirectory() {
        Path folder = Path.of(SELECTED_DIR);
        if (!Files.exists(folder)) {
            try {
                Files.createDirectories(folder);
            } catch (IOException e) {
                throw new RuntimeException("Could not create selected-exercises directory", e);
            }
        }
        return folder;
    }

    private Path selectedFilePath(Long workoutDayId) {
        return selectedDirectory().resolve(workoutDayId + ".json");
    }

    private List<Long> readSelectedIds(Long workoutDayId) {
        Path file = selectedFilePath(workoutDayId);
        if (!Files.exists(file)) {
            return List.of();
        }
        try {
            byte[] data = Files.readAllBytes(file);
            if (data.length == 0) {
                return List.of();
            }
            return objectMapper.readValue(data, new TypeReference<List<Long>>() {});
        } catch (IOException e) {
            throw new RuntimeException("Error reading selected-exercises file for day " + workoutDayId, e);
        }
    }

    private void writeSelectedIds(Long workoutDayId, List<Long> values) {
        Path file = selectedFilePath(workoutDayId);
        try {
            byte[] bytes = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(values);
            Files.write(file, bytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Error writing selected-exercises file for day " + workoutDayId, e);
        }
    }
}
