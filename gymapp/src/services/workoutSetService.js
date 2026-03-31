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

