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
} from "../services/exerciseService";

import {
  completeWorkoutDay,
  markAbdominalWorkoutDay,
  isAbdominalWorkoutDay,
  getWorkoutDayExercises
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

const [allExercises,setAllExercises] = useState([]);
const [displayedExercises,setDisplayedExercises] = useState([]);
const [selectedExerciseIds,setSelectedExerciseIds] = useState([]);
const [reps,setReps] = useState(null);
const [selectedExercise,setSelectedExercise] = useState(null);
const [isSelectionModalOpen,setIsSelectionModalOpen] = useState(false);

const navigate = useNavigate();

const [confirmFinish,setConfirmFinish] = useState(false);
const [isAbdominal,setIsAbdominal] = useState(false);

useEffect(()=>{
 loadData();
},[]);

const loadData = async ()=>{

 const abs = await isAbdominalWorkoutDay(workoutDayId);
 setIsAbdominal(abs);

 const workoutDayData = await getWorkoutDayExercises(workoutDayId);
 setReps(workoutDayData.reps ?? null);
 const workoutExercises = workoutDayData.exercises ?? [];

 const allDayExercises = await getWorkoutExercises(workoutDayId);

 // combine and deduplicate
 const combined = [ ...workoutExercises, ...allDayExercises ]
   .reduce((map, ex) => map.set(ex.id, { ...map.get(ex.id), ...ex }), new Map());
 const combinedList = Array.from(combined.values());

 setAllExercises(combinedList);
 setDisplayedExercises(workoutExercises);
 setSelectedExerciseIds(workoutExercises.map((ex) => ex.id));

};

const toggleCompleteExercise = async(ex)=>{

 let updated;

 if(ex.completed){
  updated = await uncompleteWorkoutExercise(ex.id);
 }else{
  updated = await completeWorkoutExercise(ex.id);
 }

 const updateItem = (item) => {
  if (item.id !== updated.id) return item;
  return {
    ...updated,
    exercise: item.exercise || null,
  };
};

const updatedAll = allExercises.map(updateItem);
const updatedDisplayed = displayedExercises.map(updateItem);

setAllExercises(updatedAll);
setDisplayedExercises(updatedDisplayed);
setSelectedExercise(updatedDisplayed.find((e) => e.id === updated.id) || null);

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

{displayedExercises.map((ex)=>(

<GymCard
 key={ex.id}
 title={`🏋️ ${ex.exerciseName ?? ex.exercise?.name ?? "Ejercicio"}`}
 subtitle={`Peso: ${ex.weight ?? 0} kg • Reps: ${reps ?? "-"}`}
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

<Stack direction="row" spacing={1}>
<Button
 fullWidth
 size="large"
 variant="outlined"
 color="secondary"
 onClick={()=>setIsSelectionModalOpen(true)}
 sx={{fontWeight:700}}
>
Seleccionar ejercicios
</Button>

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
</Stack>

</Box>

{/* MODAL EJERCICIO */}

<Dialog
 open={!!selectedExercise}
 onClose={()=>setSelectedExercise(null)}
 fullWidth
 maxWidth="sm"
>

{selectedExercise?.video ? (

<video
 controls
 src={getExerciseVideoUrl(selectedExercise.video)}
 style={{
  width:"100%",
  maxHeight:"260px",
  objectFit:"contain",
  background:"#000"
 }}
/>

) : selectedExercise?.image ? (

<img
 src={getExerciseImageUrl(selectedExercise.image)}
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
Repeticiones: <b>{reps ?? "-"}</b>
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

{/* MODAL DE SELECCIÓN DE EJERCICIOS */}

<Dialog
 open={isSelectionModalOpen}
 onClose={()=>setIsSelectionModalOpen(false)}
 fullWidth
 maxWidth="sm"
>
<DialogTitle sx={{fontWeight:700}}>
Seleccionar ejercicios
</DialogTitle>

<DialogContent>
<Stack spacing={1}>
{allExercises.map((ex)=>{
 const isSelected = selectedExerciseIds.includes(ex.id);
 return (
 <Box
  key={ex.id}
  onClick={()=>{
    setSelectedExerciseIds((prev)=>
      prev.includes(ex.id)
        ? prev.filter((id)=>id!==ex.id)
        : [...prev, ex.id]
    );
  }}
  sx={{
    p:2,
    borderRadius:2,
    border: `2px solid ${isSelected ? "#4caf50" : "#ddd"}`,
    cursor:"pointer",
    backgroundColor: isSelected ? "rgba(76, 175, 80, 0.08)" : "#fff"
  }}
 >
  <Typography fontWeight={700}>
    {ex.exerciseName ?? ex.exercise?.name ?? "Ejercicio"}
  </Typography>
  <Typography variant="body2">
    Peso: {ex.weight ?? 0} kg • Reps: {reps ?? "-"}
  </Typography>
 </Box>
 );
})}
</Stack>
</DialogContent>

<DialogActions sx={{p:2, display:"flex", flexDirection:"column", gap:1}}>
<Button
 fullWidth
 variant="contained"
 onClick={()=>{
   const chosen = allExercises.filter((ex)=> selectedExerciseIds.includes(ex.id));
   if(chosen.length > 0){
     setDisplayedExercises(chosen);
   } else {
     setDisplayedExercises(allExercises);
   }
   setIsSelectionModalOpen(false);
 }}
>
 Seleccionar ejercicios
</Button>
<Button
 fullWidth
 onClick={()=>setIsSelectionModalOpen(false)}
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