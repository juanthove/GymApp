export async function getWorkoutDays(workoutId) {
  const response = await fetch(`/api/workout-days/workout/${workoutId}`);

  if (!response.ok) {
    throw new Error("Error obteniendo los días del workout");
  }

  return response.json();
}