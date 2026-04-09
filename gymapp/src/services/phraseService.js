import { apiRequest } from "./apiClient";

const PHRASE_API = "/api/phrases";

// Crear frase
export async function createPhrase(phrase) {
  return apiRequest(PHRASE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(phrase),
  });
}

// Obtener todas
export async function getPhrases() {
  return apiRequest(PHRASE_API);
}

// Obtener por id
export async function getPhraseById(id) {
  return apiRequest(`${PHRASE_API}/${id}`);
}

// Obtener random 🔥
export async function getRandomPhrase() {
  return apiRequest(`${PHRASE_API}/random`);
}

// Actualizar
export async function updatePhrase(id, phrase) {
  return apiRequest(`${PHRASE_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(phrase),
  });
}

// Eliminar
export async function deletePhrase(id) {
  await apiRequest(`${PHRASE_API}/${id}`, {
    method: "DELETE",
  });
  return true;
}