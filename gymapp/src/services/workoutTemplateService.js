import { apiRequest } from "./apiClient";

const API_URL = "/api/workout-template";


export async function getWorkoutTemplates(){
  return apiRequest(API_URL);
}



export async function getWorkoutTemplateById(id){
  return apiRequest(`${API_URL}/full/${id}`);
}



export async function createWorkoutTemplate(templateData){
  return apiRequest(`${API_URL}/full`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(templateData)
  });
}



export async function updateWorkoutTemplate(id,templateData){
  return apiRequest(`${API_URL}/full/${id}`,{
    method:"PUT",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(templateData)
  });
}



export async function deleteWorkoutTemplate(id){
  await apiRequest(`${API_URL}/full/${id}`,{
    method:"DELETE"
  });
}
