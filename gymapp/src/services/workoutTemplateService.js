import { apiRequest } from "./apiClient";

const TEMPLATE_API = "/api/workout-template";
const DAY_API = "/api/workout-template-days";


export async function getWorkoutTemplates(){
  return apiRequest(TEMPLATE_API);
}

export async function getWorkoutTemplateById(id){
  return apiRequest(`/api/workout-template/full/${id}`);
}

export async function createWorkoutTemplate(data){
  return apiRequest(TEMPLATE_API,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(data)
  });
}

export async function updateWorkoutTemplate(id,data){
  return apiRequest(`${TEMPLATE_API}/${id}`,{
    method:"PUT",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(data)
  });
}

export async function deleteWorkoutTemplate(id){
  return apiRequest(`${TEMPLATE_API}/${id}`,{
    method:"DELETE"
  });
}


export async function getDaysByTemplate(templateId){
  return apiRequest(`${DAY_API}/template/${templateId}`);
}

export async function createDay(data){
  return apiRequest(DAY_API,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(data)
  });
}

export async function updateDay(id,data){
  return apiRequest(`${DAY_API}/${id}`,{
    method:"PUT",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(data)
  });
}

export async function deleteDay(id){
  return apiRequest(`${DAY_API}/${id}`,{
    method:"DELETE"
  });
}

export async function reorderDays(templateId, days){
  return apiRequest(`${DAY_API}/reorder/${templateId}`,{
    method:"PUT",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(days) // [{id, dayOrder}]
  });
}


export async function uploadWorkoutTemplateDayImage(dayId, file){
  const formData = new FormData();
  formData.append("muscleImage", file);

  return apiRequest(`${DAY_API}/${dayId}/muscle-image`,{
    method:"POST",
    body:formData
  });
}

export async function deleteWorkoutTemplateDayImage(dayId){
  return apiRequest(`${DAY_API}/${dayId}/muscle-image`,{
    method:"DELETE"
  });
}

export function getWorkoutTemplateDayImageUrl(filename){
  if (!filename) return null;
  return `${DAY_API}/muscle-image/${filename}`;
}


export async function addExerciseToDay(dayId, exerciseId, order){
  return apiRequest(`${DAY_API}/${dayId}/exercises`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ exerciseId, order })
  });
}

export async function removeExerciseFromDay(exerciseId){
  return apiRequest(`${DAY_API}/exercises/${exerciseId}`,{
    method:"DELETE"
  });
}

export async function reorderExercises(dayId, exercises){
  return apiRequest(`${DAY_API}/${dayId}/exercises/reorder`,{
    method:"PUT",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(exercises)
  });
}