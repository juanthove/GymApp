import { apiRequest } from "./apiClient";

const USER_LEVEL_API = "/api/user-levels";

// Obtener todos los niveles de usuario
export async function getUserLevels() {
  return apiRequest(USER_LEVEL_API);
}

// Obtener nivel de usuario por id
export async function getUserLevelById(id) {
  return apiRequest(`${USER_LEVEL_API}/${id}`);
}

// Crear nivel de usuario
export async function createUserLevel(userLevel) {
  return apiRequest(USER_LEVEL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userLevel),
  });
}

// Actualizar nivel de usuario
export async function updateUserLevel(id, userLevel) {
  return apiRequest(`${USER_LEVEL_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userLevel),
  });
}

// Eliminar nivel de usuario
export async function deleteUserLevel(id) {
  return apiRequest(`${USER_LEVEL_API}/${id}`, {
    method: "DELETE",
  });
}

//Reordenar niveles
export async function updateUserLevelsOrder(levels) {
  return apiRequest(`${USER_LEVEL_API}/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(levels),
  });
}