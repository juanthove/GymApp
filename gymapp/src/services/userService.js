import { apiRequest } from "./apiClient";

// Crear usuario
export async function createUser(user) {
  return apiRequest("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
}

// Obtener todos los usuarios
export async function getUsers() {
  return apiRequest("/api/users");
}

// Obtener usuario por id
export async function getUserById(id) {
  return apiRequest(`/api/users/${id}`);
}

// Usuarios logueados
export async function getLoggedUser() {
  return apiRequest(`/api/users/logged`);
}

// Usuarios no logueados
export async function getNotLoggedUser() {
  return apiRequest(`/api/users/not-logged`);
}

// Actualizar usuario
export async function updateUser(id, user) {
  return apiRequest(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
}

// Eliminar usuario
export async function deleteUser(id) {
  await apiRequest(`/api/users/${id}`, {
    method: "DELETE",
  });
  return true;
}

// Login
export async function loginUser(userId) {
  return apiRequest(`/api/users/${userId}/login`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });
}

// Logout
export async function logoutUser(userId) {
  return apiRequest(`/api/users/${userId}/logout`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });
}

// Obtener el workout actual del usuario
export async function getCurrentWorkout(userId) {
  return apiRequest(`/api/users/${userId}/current-workout`);
}

// Cambiar workout actual del usuario
export async function setCurrentWorkout(userId, workoutId) {
  return apiRequest(`/api/users/${userId}/current-workout/${workoutId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
}

