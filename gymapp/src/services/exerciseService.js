//Funciones sobre ejercicios
import { apiRequest } from "./apiClient";

export async function getExercises() {
  return apiRequest("/api/exercises");
}

export async function getExerciseById(id) {
  return apiRequest(`/api/exercises/${id}`);
}

export async function createExercise(exercise) {

  const formData = new FormData();

  formData.append("name", exercise.name);
  formData.append("description", exercise.description);

  formData.append("type", exercise.type);

  if (exercise.image) {
    formData.append("image", exercise.image);
  }

  if (exercise.video) {
    formData.append("video", exercise.video);
  }

  return apiRequest("/api/exercises", {
    method: "POST",
    body: formData
  });
}

export async function updateExercise(id, exercise) {

  const formData = new FormData();

  formData.append("name", exercise.name);
  formData.append("description", exercise.description);

  formData.append("type", exercise.type);

  if (exercise.image) {
    formData.append("image", exercise.image);
  }

  if (exercise.video) {
    formData.append("video", exercise.video);
  }

  formData.append("deleteImage", exercise.deleteImage);
  formData.append("deleteVideo", exercise.deleteVideo);

  return apiRequest(`/api/exercises/${id}`, {
    method: "PUT",
    body: formData
  });
}

export async function deleteExercise(id) {
  await apiRequest(`/api/exercises/${id}`, {
    method: "DELETE"
  });
}

// Obtener URL de la imagen de un ejercicio
export function getExerciseImageUrl(filename) {
  if (!filename) return null;
  return `/api/exercises/image/${filename}`;
}

// Obtener URL del video de un ejercicio
export function getExerciseVideoUrl(filename) {
  if (!filename) return null;
  return `/api/exercises/video/${filename}`;
}