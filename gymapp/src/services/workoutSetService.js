import { apiRequest } from "./apiClient";

const API_URL = "/api/workout-sets";

export async function getWorkoutSets() {
	return apiRequest(API_URL);
}

export async function getWorkoutSetById(id) {
	return apiRequest(`${API_URL}/${id}`);
}

export async function getWorkoutSetsByUser(userId) {
	return apiRequest(`${API_URL}/user/${userId}`);
}

export async function getWorkoutSetsByUserAndDateRange(userId, from, to) {
	const params = new URLSearchParams();
	if (from) params.append("from", from);
	if (to) params.append("to", to);
	const query = params.toString();
	return apiRequest(`${API_URL}/user/${userId}/range${query ? `?${query}` : ""}`);
}

export async function getTotalWorkoutVolumeByUserAndDateRange(userId, from, to) {
	const params = new URLSearchParams();
	if (from) params.append("from", from);
	if (to) params.append("to", to);
	const query = params.toString();
	return apiRequest(`${API_URL}/user/${userId}/volume${query ? `?${query}` : ""}`);
}

export async function getWeeklyMuscleVolumeByUserAndDateRange(userId, from, to) {
	const params = new URLSearchParams();
	if (from) params.append("from", from);
	if (to) params.append("to", to);
	const query = params.toString();
	return apiRequest(`${API_URL}/user/${userId}/volume/weekly-by-muscle${query ? `?${query}` : ""}`);
}

export async function getVolumeByUserAndDateRange(userId, from, to, granularity) {
  const params = new URLSearchParams();

  if (from) params.append("from", from);
  if (to) params.append("to", to);
  if (granularity) params.append("granularity", granularity);

  const query = params.toString();

  return apiRequest(`${API_URL}/user/${userId}/volume-series${query ? `?${query}` : ""}`);
}

export async function getWorkoutSetsByWorkoutExercise(workoutExerciseId) {
	return apiRequest(`${API_URL}/workout-exercise/${workoutExerciseId}`);
}

export async function createWorkoutSet(workoutSetData) {
	return apiRequest(API_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(workoutSetData),
	});
}

export async function updateWorkoutSet(id, workoutSetData) {
	return apiRequest(`${API_URL}/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(workoutSetData),
	});
}

export async function deleteWorkoutSet(id) {
	await apiRequest(`${API_URL}/${id}`, {
		method: "DELETE",
	});
	return true;
}

