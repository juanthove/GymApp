import { apiRequest } from "./apiClient";

const USER_EXERCISE_API = "/api/user-exercises";

//Obtener todos los ejercicios del usuario
export async function getUserExercises(userId) {
  return apiRequest(`${USER_EXERCISE_API}/user/${userId}`);
}

//Crear ejercicio para el usuario
export async function createUserExercise(userId, userExercise) {
  return apiRequest(`${USER_EXERCISE_API}/user/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userExercise),
  });
}

//Actualizar ejercicio del usuario
export async function updateUserExercise(id, userExercise) {
  return apiRequest(`${USER_EXERCISE_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userExercise),
  });
}

//Eliminar ejercicio del usuario
export async function deleteUserExercise(id) {
  await apiRequest(`${USER_EXERCISE_API}/${id}`, {
    method: "DELETE",
  });
  return true;
}

// Guardar todos los ejercicios del usuario
export async function saveUserExercises(userId, data) {
  return apiRequest(`${USER_EXERCISE_API}/user/${userId}/exercises`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
