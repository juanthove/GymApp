import { apiRequest } from "./apiClient";

const USER_API = "/api/users";

// Crear usuario
export async function createUser(user) {
  return apiRequest(USER_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
}

// Obtener todos los usuarios
export async function getUsers() {
  return apiRequest(USER_API);
}

// Obtener usuario por id
export async function getUserById(id) {
  return apiRequest(`${USER_API}/${id}`);
}

// Usuarios logueados
export async function getLoggedUser() {
  return apiRequest(`${USER_API}/logged`);
}

// Usuarios no logueados
export async function getNotLoggedUser() {
  return apiRequest(`${USER_API}/not-logged`);
}

// Actualizar usuario
export async function updateUser(id, user) {
  return apiRequest(`${USER_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
}

// Eliminar usuario
export async function deleteUser(id) {
  await apiRequest(`${USER_API}/${id}`, {
    method: "DELETE",
  });
  return true;
}

export async function uploadUserImage(userId, file) {
  const formData = new FormData();
  formData.append("image", file);

  return apiRequest(`${USER_API}/${userId}/image`, {
    method: "POST",
    body: formData,
  });
}

export async function deleteUserImage(userId) {
  return apiRequest(`${USER_API}/${userId}/image`, {
    method: "DELETE",
  });
}

export function getUserImageUrl(filename) {
  if (!filename) return null;
  return `${USER_API}/image/${filename}`;
}

// Login
export async function loginUser(userId) {
  return apiRequest(`${USER_API}/${userId}/login`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });
}

// Logout
export async function logoutUser(userId) {
  return apiRequest(`${USER_API}/${userId}/logout`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });
}

// Obtener el workout actual del usuario
export async function getCurrentWorkout(userId) {
  return apiRequest(`${USER_API}/${userId}/current-workout`);
}

// Cambiar workout actual del usuario
export async function setCurrentWorkout(userId, workoutId) {
  return apiRequest(`${USER_API}/${userId}/current-workout/${workoutId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
}

// Obtener todos los logros del usuario (bloqueados y desbloqueados)
export async function getUserAchievements(userId) {
  return apiRequest(`${USER_API}/${userId}/achievements`);
}

