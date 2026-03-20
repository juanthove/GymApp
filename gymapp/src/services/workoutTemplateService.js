import { apiRequest } from "./apiClient";

const TEMPLATE_API = "/api/workout-template";
const DAY_API = "/api/workout-template-days";

// =========================
// TEMPLATE (FULL)
// =========================

export async function getWorkoutTemplates(){
  return apiRequest(TEMPLATE_API);
}

export async function getWorkoutTemplateById(id){
  return apiRequest(`${TEMPLATE_API}/full/${id}`);
}

export async function createWorkoutTemplate(data){
  return apiRequest(`${TEMPLATE_API}/full`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(data)
  });
}

export async function updateWorkoutTemplate(id,data){
  return apiRequest(`${TEMPLATE_API}/full/${id}`,{
    method:"PUT",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(data)
  });
}

export async function deleteWorkoutTemplate(id){
  return apiRequest(`${TEMPLATE_API}/full/${id}`,{
    method:"DELETE"
  });
}


// =========================
// IMÁGENES DE DÍA
// =========================

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

export function deleteWorkoutTemplateDayImageByFilename(filename){
  if (!filename) return null;
  return apiRequest(`${DAY_API}/muscle-image/file/${filename}`,{
    method:"DELETE"
  });
}