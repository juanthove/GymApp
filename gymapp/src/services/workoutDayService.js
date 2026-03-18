import { apiRequest } from "./apiClient";

export async function getWorkoutDays(workoutId) {
  return apiRequest(`/api/workout-days/workout/${workoutId}`);
}

export async function startWorkoutDay(id) {
  return apiRequest(`/api/workout-days/${id}/start`, {
    method: "PATCH"
  });
}

export async function completeWorkoutDay(id) {
  return apiRequest(`/api/workout-days/${id}/complete`, {
    method: "PATCH"
  });
}

export async function markAbdominalWorkoutDay(id) {
  return apiRequest(`/api/workout-days/${id}/abdominal`, {
    method: "PATCH"
  });
}

export async function isAbdominalWorkoutDay(id) {
  return apiRequest(`/api/workout-days/${id}/is-abdominal`);
}

export async function getWorkoutDayStatus(id) {
  return apiRequest(`/api/workout-days/${id}/status`, {}, "text");
}

export async function getWorkoutDayExercises(id) {
  return apiRequest(`/api/workout-days/${id}/exercises`);
}