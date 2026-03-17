import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  getWorkoutExercises,
  completeWorkoutExercise,
  uncompleteWorkoutExercise
} from "../services/workoutExerciseService";

import {
  getExerciseImageUrl,
  getExerciseVideoUrl,
  getExercises,
} from "../services/exerciseService";

import {
  completeWorkoutDay,
  markAbdominalWorkoutDay,
  isAbdominalWorkoutDay
} from "../services/workoutDayService";

import GymCard from "../components/GymCard";
import BackButton from "../components/BackButton";

import {
  Container,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box
} from "@mui/material";

export default function ExerciseScreen(){

const { userId, workoutDayId } = useParams();

const [exercises,setExercises] = useState([]);
const [selectedExercise,setSelectedExercise] = useState(null);

const navigate = useNavigate();

const [confirmFinish,setConfirmFinish] = useState(false);
const [isAbdominal,setIsAbdominal] = useState(false);

useEffect(()=>{
 loadData();
},[]);

const loadData = async ()=>{

 const abs = await isAbdominalWorkoutDay(workoutDayId);
 setIsAbdominal(abs);

 const [workoutExercises, exerciseCatalog] = await Promise.all([
  getWorkoutExercises(workoutDayId),
  getExercises()
 ]);

 const exerciseById = Object.fromEntries(
  exerciseCatalog.map((exercise) => [exercise.id, exercise])
 );

 const merged = workoutExercises.map((item) => ({
  ...item,
  exercise: exerciseById[item.exerciseId] || null,
 }));

 setExercises(merged);

};

const toggleCompleteExercise = async(ex)=>{

 let updated;

 if(ex.completed){
  updated = await uncompleteWorkoutExercise(ex.id);
 }else{
  updated = await completeWorkoutExercise(ex.id);
 }

 const updatedList = exercises.map((e) => {
  if (e.id !== updated.id) {
    return e;
  }

  // Keep enriched exercise details already loaded in UI.
  return {
    ...updated,
    exercise: e.exercise || null,
  };
 });

 setExercises(updatedList);
 setSelectedExercise(updatedList.find((e) => e.id === updated.id) || null);

};

const handleFinishClick = ()=>{

 if(isAbdominal){
  finishDay();
 }else{
  setConfirmFinish(true);
 }

};

const finishDay = async()=>{

 await completeWorkoutDay(workoutDayId);

 setConfirmFinish(false);

 navigate(`/final/${userId}/${workoutDayId}`);

};

const finishDayWithAbs = async () => {

 await markAbdominalWorkoutDay(workoutDayId);

 setConfirmFinish(false);

 await loadData();

};

return(

<Container maxWidth="sm" sx={{mt:6,mb:10}}>

<Stack direction="row" alignItems="center" spacing={1} sx={{position:"relative", mb:2}}>
 <BackButton to={`/workout/${userId}`} sx={{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)" }} />
 <Typography variant="h5" textAlign="center" sx={{width:"100%"}}>
  Ejercicios del día
 </Typography>
</Stack>

<Stack spacing={2}>

{exercises.map((ex)=>(

<GymCard
 key={ex.id}
 title={`🏋️ ${ex.exerciseName ?? ex.exercise?.name ?? "Ejercicio"}`}
 subtitle={`Peso: ${ex.weight ?? 0} kg • Orden: ${ex.exerciseOrder ?? "-"}`}
 onClick={()=>setSelectedExercise(ex)}
>

{ex.completed &&
 <Typography color="success.main" fontWeight={700}>
  ✔ Completado
 </Typography>
}

</GymCard>

))}

</Stack>

{/* BOTON FINALIZAR */}

<Box
 sx={{
  position:"fixed",
  bottom:0,
  left:0,
  right:0,
  p:2,
  background:"#fff",
  borderTop:"1px solid #ddd"
 }}
>

<Button
 fullWidth
 size="large"
 variant="contained"
 color="primary"
 onClick={handleFinishClick}
 sx={{fontWeight:700}}
>
Finalizar día
</Button>

</Box>

{/* MODAL EJERCICIO */}

<Dialog
 open={!!selectedExercise}
 onClose={()=>setSelectedExercise(null)}
 fullWidth
 maxWidth="sm"
>

{selectedExercise?.exercise?.video ? (

<video
 controls
 src={getExerciseVideoUrl(selectedExercise.exercise.video)}
 style={{
  width:"100%",
  maxHeight:"260px",
  objectFit:"contain",
  background:"#000"
 }}
/>

) : selectedExercise?.exercise?.image ? (

<img
 src={getExerciseImageUrl(selectedExercise.exercise.image)}
 style={{
  width:"100%",
  maxHeight:"260px",
  objectFit:"contain",
  background:"#000"
 }}
/>

) : null}

<DialogTitle sx={{fontWeight:700}}>
{selectedExercise?.exercise?.name || selectedExercise?.exerciseName}
</DialogTitle>

<DialogContent>

<Stack spacing={2}>

{selectedExercise?.exercise?.description &&

<Typography
 color="text.secondary"
 sx={{
  background:"#f5f5f5",
  p:2,
  borderRadius:"8px"
 }}
>
{selectedExercise.exercise.description}
</Typography>

}

<Typography>
Peso: <b>{selectedExercise?.weight ?? 0} kg</b>
</Typography>

<Typography>
Orden: <b>{selectedExercise?.exerciseOrder ?? "-"}</b>
</Typography>

{selectedExercise?.comment &&

<Typography color="text.secondary">
Comentario: {selectedExercise.comment}
</Typography>

}

</Stack>

</DialogContent>

<DialogActions
 sx={{
  p:2,
  display:"flex",
  flexDirection:"column",
  gap:1
 }}
>

<Button
 fullWidth
 size="large"
 variant="contained"
 color={selectedExercise?.completed ? "error" : "success"}
 onClick={()=>toggleCompleteExercise(selectedExercise)}
 sx={{fontWeight:700}}
>
{selectedExercise?.completed
 ? "Quitar completado"
 : "Marcar como completado"}
</Button>

<Button
 fullWidth
 onClick={()=>setSelectedExercise(null)}
>
Cerrar
</Button>

</DialogActions>

</Dialog>

{/* MODAL ABDOMINALES */}

<Dialog
 open={confirmFinish}
 onClose={()=>setConfirmFinish(false)}
>

<DialogTitle>
Finalizar día
</DialogTitle>

<DialogContent>

<Typography>
¿Querés hacer abdominales antes de terminar la rutina?
</Typography>

</DialogContent>

<DialogActions>

<Button
 onClick={finishDay}
>
No
</Button>

<Button
 variant="contained"
 onClick={finishDayWithAbs}
>
Sí, agregar abdominales
</Button>

</DialogActions>

</Dialog>

</Container>

);

}