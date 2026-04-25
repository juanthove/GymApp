import { apiRequest } from "./apiClient";

const SYSTEM_USER_API = "/api/system-users";

// Crear system user (admin / staff)
export async function createSystemUser(user) {
  return apiRequest(SYSTEM_USER_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
}

//Modificar system user
export async function updateSystemUser(id, user) {
  return apiRequest(`${SYSTEM_USER_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
}

// Obtener todos
export async function getSystemUsers() {
  return apiRequest(SYSTEM_USER_API);
}

// Obtener por id
export async function getSystemUserById(id) {
  return apiRequest(`${SYSTEM_USER_API}/${id}`);
}

// Eliminar
export async function deleteSystemUser(id) {
  await apiRequest(`${SYSTEM_USER_API}/${id}`, {
    method: "DELETE",
  });
  return true;
}

// LOGIN
export async function loginSystemUser(credentials) {
  return apiRequest(`${SYSTEM_USER_API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}