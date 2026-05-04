import { apiRequest } from "./apiClient";

const ACHIEVEMENT_API = "/api/achievements";

// Obtener todos los logros
export async function getAchievements() {
  return apiRequest(ACHIEVEMENT_API);
}

// Obtener logro por id
export async function getAchievementById(id) {
  return apiRequest(`${ACHIEVEMENT_API}/${id}`);
}

// Crear logro
export async function createAchievement(achievement) {
  return apiRequest(ACHIEVEMENT_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(achievement),
  });
}

// Actualizar logro
export async function updateAchievement(id, achievement) {
  return apiRequest(`${ACHIEVEMENT_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(achievement),
  });
}

// Eliminar logro
export async function deleteAchievement(id) {
  return apiRequest(`${ACHIEVEMENT_API}/${id}`, {
    method: "DELETE",
  });
}