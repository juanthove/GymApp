const API_URL = "http://localhost:8080/api/workout-template";


export async function getWorkoutTemplates(){

  const response = await fetch(API_URL);

  if(!response.ok){
    throw new Error("Error al obtener templates");
  }

  return await response.json();
}



export async function getWorkoutTemplateById(id){

  const response = await fetch(`${API_URL}/full/${id}`);

  if(!response.ok){
    throw new Error("Error al obtener el template");
  }

  return await response.json();
}



export async function createWorkoutTemplate(templateData){

  const response = await fetch(`${API_URL}/full`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(templateData)
  });

  if(!response.ok){
    throw new Error("Error al crear template");
  }

  return await response.json();
}



export async function updateWorkoutTemplate(id,templateData){

  const response = await fetch(`${API_URL}/full/${id}`,{
    method:"PUT",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(templateData)
  });

  if(!response.ok){
    throw new Error("Error al actualizar template");
  }

  return await response.json();
}



export async function deleteWorkoutTemplate(id){

  const response = await fetch(`${API_URL}/full/${id}`,{
    method:"DELETE"
  });

  if(!response.ok){
    throw new Error("Error al eliminar template");
  }
}
