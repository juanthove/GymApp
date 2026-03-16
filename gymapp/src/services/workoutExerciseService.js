export async function getExercisesByWorkoutDay(dayId) {

  const response = await fetch(`/api/workout-exercises/day/${dayId}`);

  if (!response.ok) {
    throw new Error("Error obteniendo ejercicios del día");
  }

  return response.json();
}

export async function getExercisesWithoutAbdominals(dayId) {

  const response = await fetch(
    `/api/workout-exercises/day/${dayId}/no-abdominals`
  );

  if (!response.ok) {
    throw new Error("Error obteniendo ejercicios del día");
  }

  return response.json();
}

export async function getAbdominalExercises(dayId) {

  const response = await fetch(`/api/workout-exercises/day/${dayId}/abdominals`);

  if (!response.ok) {
    throw new Error("Error obteniendo abdominales");
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