import { apiRequest } from "./apiClient";

const API_URL = "/api/workout-saves";

export async function getAllWorkoutSaves() {
  return apiRequest(API_URL);
}

export async function getWorkoutSaveById(id) {
  return apiRequest(`${API_URL}/${id}`);
}

export async function getWorkoutSavesByWorkout(workoutId) {
  return apiRequest(`${API_URL}/workout/${workoutId}`);
}

export async function getWorkoutSavesByUser(userId) {
  return apiRequest(`${API_URL}/user/${userId}`);
}

export async function createWorkoutSave(workoutSaveData) {
  return apiRequest(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workoutSaveData),
  });
}

export async function updateWorkoutSave(id, workoutSaveData) {
  return apiRequest(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workoutSaveData),
  });
}

export async function deleteWorkoutSave(id) {
  await apiRequest(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
