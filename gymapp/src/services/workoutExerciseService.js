export async function getWorkoutExercises(workoutDayId) {
  const response = await fetch(`/api/workout-exercises/day/${workoutDayId}`);

  if (!response.ok) {
    throw new Error("Error obteniendo los ejercicios del día");
  }

  return response.json();
}

export async function completeWorkoutExercise(id) {

  const response = await fetch(`/api/workout-exercises/${id}/complete`, {
    method: "PATCH"
  });

  if (!response.ok) {
    throw new Error("Error completando ejercicio");
  }

  return response.json();
}

export async function uncompleteWorkoutExercise(id) {

  const response = await fetch(`/api/workout-exercises/${id}/uncomplete`, {
    method: "PATCH"
  });

  if (!response.ok) {
    throw new Error("Error descompletando ejercicio");
  }

  return response.json();
}