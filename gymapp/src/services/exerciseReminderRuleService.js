import { apiRequest } from "./apiClient";

export async function getExerciseReminderRules() {
  return apiRequest("/api/exercise-reminder-rules");
}

export async function getExerciseReminderRuleById(id) {
  return apiRequest(`/api/exercise-reminder-rules/${id}`);
}

export async function getExerciseReminderRuleByExercise(exerciseId) {
  return apiRequest(`/api/exercise-reminder-rules/exercise/${exerciseId}`);
}

export async function createExerciseReminderRule(rule) {
  return apiRequest("/api/exercise-reminder-rules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rule)
  });
}

export async function updateExerciseReminderRule(id, rule) {
  return apiRequest(`/api/exercise-reminder-rules/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rule)
  });
}

export async function deleteExerciseReminderRule(id) {
  await apiRequest(`/api/exercise-reminder-rules/${id}`, {
    method: "DELETE"
  });
}
