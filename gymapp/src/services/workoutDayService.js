import { apiRequest } from "./apiClient";

const DAY_API = "/api/workout-days";

export async function getWorkoutDays(workoutId) {
  return apiRequest(`${DAY_API}/workout/${workoutId}`);
}

export async function startWorkoutDay(id) {
  return apiRequest(`${DAY_API}/${id}/start`, {
    method: "PATCH"
  });
}

export async function completeWorkoutDay(id) {
  return apiRequest(`${DAY_API}/${id}/complete`, {
    method: "PATCH"
  });
}

export async function markAbdominalWorkoutDay(id) {
  return apiRequest(`${DAY_API}/${id}/abdominal`, {
    method: "PATCH"
  });
}

export async function isAbdominalWorkoutDay(id) {
  return apiRequest(`${DAY_API}/${id}/is-abdominal`);
}

export async function getWorkoutDayStatus(id) {
  return apiRequest(`${DAY_API}/${id}/status`, {}, "text");
}

export async function getWorkoutDayExercises(id) {
  return apiRequest(`${DAY_API}/${id}/exercises`);
}

export async function uploadWorkoutDayImage(dayId, file) {
  const formData = new FormData();
  formData.append("muscleImage", file);

  return apiRequest(`${DAY_API}/${dayId}/muscle-image`, {
    method: "POST",
    body: formData,
  });
}

export async function deleteWorkoutDayImage(dayId) {
  return apiRequest(`${DAY_API}/${dayId}/muscle-image`, {
    method: "DELETE",
  });
}

export function getWorkoutDayImageUrl(filename) {
  if (!filename) return null;
  return `${DAY_API}/muscle-image/${filename}`;
}

export function deleteWorkoutDayImageByFilename(filename) {
  if (!filename) return null;
  return apiRequest(`${DAY_API}/muscle-image/file/${filename}`, {
    method: "DELETE",
  });
}