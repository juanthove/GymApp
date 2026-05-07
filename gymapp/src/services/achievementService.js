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
  const formData = new FormData();

  formData.append("name", achievement.name);
  formData.append("type", achievement.type);
  formData.append("levelId", achievement.levelId);
  formData.append("requiredValue", achievement.requiredValue);

  if (achievement.muscle) {
    formData.append("muscle", achievement.muscle);
  }

  if (achievement.exerciseId) {
    formData.append("exerciseId", achievement.exerciseId);
  }

  if (achievement.image) {
    formData.append("image", achievement.image);
  }

  return apiRequest(ACHIEVEMENT_API, {
    method: "POST",
    body: formData,
  });
}

// Actualizar logro
export async function updateAchievement(id, achievement) {
  const formData = new FormData();

  formData.append("name", achievement.name);
  formData.append("type", achievement.type);
  formData.append("levelId", achievement.levelId);
  formData.append("requiredValue", achievement.requiredValue);

  if (achievement.muscle) {
    formData.append("muscle", achievement.muscle);
  }

  if (achievement.exerciseId) {
    formData.append("exerciseId", achievement.exerciseId);
  }

  if (achievement.image) {
    formData.append("image", achievement.image);
  }

  formData.append("deleteImage", achievement.deleteImage);

  return apiRequest(`${ACHIEVEMENT_API}/${id}`, {
    method: "PUT",
    body: formData,
  });
}

// Eliminar logro
export async function deleteAchievement(id) {
  return apiRequest(`${ACHIEVEMENT_API}/${id}`, {
    method: "DELETE",
  });
}

// 🔥 URL de imagen (igual que ejercicios)
export function getAchievementImageUrl(filename) {
  if (!filename) return null;
  return `/api/achievements/image/${filename}`;
}
