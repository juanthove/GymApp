import { apiRequest } from "./apiClient";

const API_URL = "/api/workouts";


export async function getWorkoutById(id){
  return apiRequest(`${API_URL}/full/${id}`);
}


export async function createWorkout(workoutData){
  return apiRequest(`${API_URL}/full`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(workoutData)
  });
}


export async function updateWorkout(id,workoutData){
  return apiRequest(`${API_URL}/full/${id}`,{
    method:"PUT",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(workoutData)
  });
}


export async function deleteWorkout(id){
  await apiRequest(`${API_URL}/full/${id}`,{
    method:"DELETE"
  });
}