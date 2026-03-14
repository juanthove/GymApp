// userService.js

// Crear usuario
export async function createUser(user) {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    // Intentamos leer el mensaje del backend
    let errorMessage = "Error al crear el usuario";
    try {
      errorMessage = await response.text(); // si el backend devuelve texto
    } catch (e) {
      // no pasa nada, usamos mensaje genérico
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Obtener todos los usuarios
export async function getUsers() {
  const response = await fetch("/api/users");
  if (!response.ok) throw new Error("Error al obtener los usuarios");
  return response.json();
}

// Obtener usuario por id
export async function getUserById(id) {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error("Error al obtener el usuario");
  return response.json();
}

// Usuarios logueados
export async function getLoggedUser() {
  const response = await fetch(`/api/users/logged`);
  if (!response.ok) throw new Error("Error al obtener los usuarios logueados");
  return response.json();
}

// Usuarios no logueados
export async function getNotLoggedUser() {
  const response = await fetch(`/api/users/not-logged`);
  if (!response.ok) throw new Error("Error al obtener los usuarios no logueados");
  return response.json();
}

// Actualizar usuario
export async function updateUser(id, user) {
  const response = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error("Error al actualizar el usuario");
  return response.json();
}

// Eliminar usuario
export async function deleteUser(id) {
  const response = await fetch(`/api/users/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Error al eliminar el usuario");
  return true;
}

// Login
export async function loginUser(userId) {
  const response = await fetch(`/api/users/${userId}/login`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Error al loguear el usuario");
  return response.json();
}

// Logout
export async function logoutUser(userId) {
  const response = await fetch(`/api/users/${userId}/logout`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Error al cerrar sesión del usuario");
  return response.json();
}

// Obtener el workout actual del usuario
export async function getCurrentWorkout(userId) {
  const response = await fetch(`/api/users/${userId}/current-workout`);
  if (!response.ok) throw new Error("Error al obtener el workout actual");
  return response.json();
}

// Cambiar workout actual del usuario
export async function setCurrentWorkout(userId, workoutId) {
  const response = await fetch(`/api/users/${userId}/current-workout/${workoutId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Error al cambiar el workout actual");
  return response.json();
}

