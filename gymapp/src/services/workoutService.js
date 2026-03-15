const API_URL = "http://localhost:8080/api/workouts";


export async function getWorkoutById(id){

  const response = await fetch(`${API_URL}/full/${id}`);

  if(!response.ok){
    throw new Error("Error al obtener workout");
  }

  return await response.json();
}


export async function createWorkout(workoutData){

  const response = await fetch(`${API_URL}/full`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(workoutData)
  });

  if(!response.ok){
    throw new Error("Error al crear workout");
  }

  return await response.json();
}


export async function updateWorkout(id,workoutData){

  const response = await fetch(`${API_URL}/full/${id}`,{
    method:"PUT",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(workoutData)
  });

  if(!response.ok){
    throw new Error("Error al actualizar workout");
  }

  return await response.json();
}


export async function deleteWorkout(id){

  const response = await fetch(`${API_URL}/full/${id}`,{
    method:"DELETE"
  });

  if(!response.ok){
    throw new Error("Error al eliminar workout");
  }
}