//Funciones sobre ejercicios

export async function getExercises() {
  const response = await fetch("/api/exercises");

  if (!response.ok) {
    throw new Error("Error al obtener ejercicios");
  }

  return response.json();
}

export async function getExerciseById(id) {
  const response = await fetch(`/api/exercises/${id}`);

  if (!response.ok) {
    throw new Error("Error al obtener ejercicio");
  }

  return response.json();
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

  const response = await fetch("/api/exercises", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Error al crear ejercicio");
  }

  return response.json();
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

  const response = await fetch(`/api/exercises/${id}`, {
    method: "PUT",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Error al actualizar ejercicio");
  }

  return response.json();
}

export async function deleteExercise(id) {
  const response = await fetch(`/api/exercises/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Error al eliminar ejercicio");
  }
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