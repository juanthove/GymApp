import { apiRequest } from "./apiClient";

export async function getWorkoutExercises(workoutDayId) {
  return apiRequest(`/api/workout-exercises/day/${workoutDayId}`);
}

export async function completeWorkoutExercise(id) {
  return apiRequest(`/api/workout-exercises/${id}/complete`, {
    method: "PATCH"
  });
}

export async function uncompleteWorkoutExercise(id) {
  return apiRequest(`/api/workout-exercises/${id}/uncomplete`, {
    method: "PATCH"
  });
}