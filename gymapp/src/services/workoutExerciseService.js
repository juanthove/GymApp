import { apiRequest } from "./apiClient";

export async function getWorkoutExercises(workoutDayId) {
  return apiRequest(`/api/workout-exercises/day/${workoutDayId}`);
}

export async function completeWorkoutExercise(id, nextWeight) {
  return apiRequest(`/api/workout-exercises/${id}/complete`, {
    method: "PATCH",
    body: JSON.stringify({ nextWeight }),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export async function uncompleteWorkoutExercise(id) {
  return apiRequest(`/api/workout-exercises/${id}/uncomplete`, {
    method: "PATCH"
  });
}

export async function markWorkoutExerciseSelected(workoutDayId, workoutExerciseId) {
  return apiRequest(`/api/workout-exercises/day/${workoutDayId}/exercise/${workoutExerciseId}/select`, {
    method: "POST"
  });
}

export async function unmarkWorkoutExerciseSelected(workoutDayId, workoutExerciseId) {
  return apiRequest(`/api/workout-exercises/day/${workoutDayId}/exercise/${workoutExerciseId}/unselect`, {
    method: "POST"
  });
}

export async function isWorkoutExerciseSelected(workoutDayId, workoutExerciseId) {
  return apiRequest(`/api/workout-exercises/day/${workoutDayId}/exercise/${workoutExerciseId}/selected`);
}