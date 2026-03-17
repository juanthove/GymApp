export async function getWorkoutDays(workoutId) {
  const response = await fetch(`/api/workout-days/workout/${workoutId}`);

  if (!response.ok) {
    throw new Error("Error obteniendo los días del workout");
  }

  return response.json();
}

export async function startWorkoutDay(id) {

  const response = await fetch(`/api/workout-days/${id}/start`, {
    method: "PATCH"
  });

  if (!response.ok) {
    throw new Error("Error iniciando día");
  }

  return response.json();
}

export async function completeWorkoutDay(id) {

  const response = await fetch(`/api/workout-days/${id}/complete`, {
    method: "PATCH"
  });

  if (!response.ok) {
    throw new Error("Error completando día");
  }

  return response.json();
}

export async function markAbdominalWorkoutDay(id) {

  const response = await fetch(`/api/workout-days/${id}/abdominal`, {
    method: "PATCH"
  });

  if (!response.ok) {
    throw new Error("Error marcando abdominales");
  }

  return response.json();
}

export async function isAbdominalWorkoutDay(id) {

  const response = await fetch(`/api/workout-days/${id}/is-abdominal`);

  if (!response.ok) {
    throw new Error("Error obteniendo si el día es abdominal");
  }

  return response.json();
}

export async function getWorkoutDayStatus(id) {

  const response = await fetch(`/api/workout-days/${id}/status`);

  if (!response.ok) {
    throw new Error("Error obteniendo estado del día");
  }

  return response.text();
}