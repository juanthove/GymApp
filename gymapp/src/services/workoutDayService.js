export async function getWorkoutDays(workoutId) {
  const response = await fetch(`/api/workout-days/workout/${workoutId}`);

  if (!response.ok) {
    throw new Error("Error obteniendo los días del workout");
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

export async function uncompleteWorkoutDay(id) {

  const response = await fetch(`/api/workout-days/${id}/uncomplete`, {
    method: "PATCH"
  });

  if (!response.ok) {
    throw new Error("Error descompletando día");
  }

  return response.json();
}