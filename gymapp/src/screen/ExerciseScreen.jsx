import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  getWorkoutExercises,
  completeWorkoutExercise,
  uncompleteWorkoutExercise,
  markWorkoutExerciseSelected,
  unmarkWorkoutExerciseSelected
} from "../services/workoutExerciseService";

import {
  getExerciseImageUrl,
  getExerciseVideoUrl,
  getExerciseIconUrl,
} from "../services/exerciseService";

import {
  completeWorkoutDay,
  markAbdominalWorkoutDay,
  isAbdominalWorkoutDay,
  getWorkoutDayExercises
} from "../services/workoutDayService";

import {
  getWorkoutSets,
  getWorkoutSetById,
  getWorkoutSetsByUser,
  getWorkoutSetsByWorkoutExercise,
  createWorkoutSet,
  updateWorkoutSet,
  deleteWorkoutSet
} from "../services/workoutSetService";

import GymCard from "../components/GymCard";
import BackButton from "../components/BackButton";
import MuscleChips from "../components/MuscleChips";

import {
  Container,
  Typography,
  TextField,
  Tabs,
  Tab,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Box
} from "@mui/material";

export default function ExerciseScreen(){

const { userId, workoutDayId } = useParams();

const [message, setMessage] = useState("");
const [messageType, setMessageType] = useState("success");

const [allExercises,setAllExercises] = useState([]);
const [displayedExercises,setDisplayedExercises] = useState([]);
const [selectedExerciseIds,setSelectedExerciseIds] = useState([]);
const [reps,setReps] = useState(null);
const [selectedExercise,setSelectedExercise] = useState(null);
const [isSelectionModalOpen,setIsSelectionModalOpen] = useState(false);

const navigate = useNavigate();

const [confirmFinish,setConfirmFinish] = useState(false);
const [isAbdominal,setIsAbdominal] = useState(false);

const [filterType, setFilterType] = useState("ALL");

const [sets, setSets] = useState([
  [{ reps: "", weight: "", id: null }],
  [{ reps: "", weight: "", id: null }],
  [{ reps: "", weight: "", id: null }]
]);

useEffect(()=>{
 loadData();
},[]);

useEffect(() => {
  if (!selectedExercise) return;

  loadSets();
}, [selectedExercise]);

const loadSets = async () => {
  const data = await getWorkoutSetsByWorkoutExercise(selectedExercise.id);

  if (!data || data.length === 0) return;

  const grouped = {};

  data.forEach(s => {
    if (!grouped[s.setNumber]) grouped[s.setNumber] = [];
    grouped[s.setNumber].push({
      id: s.id,
      reps: s.reps,
      weight: s.weight
    });
  });

  const result = Object.values(grouped);

  setSets(result);
};

const loadData = async () => {

  const abs = await isAbdominalWorkoutDay(workoutDayId);
  setIsAbdominal(abs);

  const workoutDayData = await getWorkoutDayExercises(workoutDayId);

  setReps(workoutDayData.reps ?? null);

  const exercises = workoutDayData.exercises ?? [];

  setAllExercises(exercises);

  const selected = exercises.filter((ex) => ex.selected);

  setSelectedExerciseIds(selected.map((ex) => ex.id));
  setDisplayedExercises(selected);

};


const formatExerciseType = (type) => {
  const map = {
    PRIMARY: "Primario",
    SECONDARY: "Secundario",
    TERTIARY: "Terciario",
    ABDOMINAL: "Abdominal"
  };
  return map[type] || type;
};

const filteredExercises = allExercises.filter((ex) => {

  // si es día abdominal → solo abdominales
  if (isAbdominal) {
    return ex.type === "ABDOMINAL";
  }

  // si no hay filtro
  if (filterType === "ALL") return true;

  return ex.type === filterType;
});



const toggleSelectedExercise = async (ex) => {
  const isSelected = selectedExerciseIds.includes(ex.id);

  if (isSelected) {
    await unmarkWorkoutExerciseSelected(workoutDayId, ex.id);
  } else {
    await markWorkoutExerciseSelected(workoutDayId, ex.id);
  }

  const newSelectedIds = isSelected
    ? selectedExerciseIds.filter((id) => id !== ex.id)
    : [...selectedExerciseIds, ex.id];

  const updatedAll = allExercises.map((item) =>
    item.id === ex.id ? { ...item, selected: !isSelected } : item
  );

  setSelectedExerciseIds(newSelectedIds);
  setAllExercises(updatedAll);

  // 🔥 CLAVE: actualizar esto SIEMPRE
  setDisplayedExercises(updatedAll.filter((item) => item.selected));
};

const toggleCompleteExercise = async(ex)=>{

  const hasInvalid = sets.some(set =>
    set.some(b => b.reps || b.weight) &&
    !set.every(b => b.reps && b.weight)
  );

  if (hasInvalid) {
    setMessage("Tenés series incompletas");
    setMessageType("error");
    return;
  }

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

const addBlock = (setIndex) => {
  const updated = [...sets];
  updated[setIndex].push({ reps: "", weight: "", id: null });
  setSets(updated);
};

const removeBlock = (setIndex, blockIndex) => {
  const updated = [...sets];
  updated[setIndex].splice(blockIndex, 1);
  setSets(updated);
};

const handleChange = (setIndex, blockIndex, field, value) => {
  const updated = [...sets];
  updated[setIndex][blockIndex][field] = value;
  setSets(updated);
};

const saveSet = async (setIndex) => {
  const blocks = sets[setIndex];

  const allEmpty = blocks.every(b => !b.reps && !b.weight);
  const allFull = blocks.every(b => b.reps && b.weight);

  if (!allEmpty && !allFull) {
    setMessage("Completá todos los bloques de la serie");
    setMessageType("error");
    return;
  }

  // 🔴 BORRAR
  if (allEmpty) {
    for (const b of blocks) {
      if (b.id) await deleteWorkoutSet(b.id);
    }
    setMessage("Serie eliminada");
    setMessageType("info");
    return;
  }

  // 🟢 GUARDAR
  for (const b of blocks) {
    if (b.id) {
      await updateWorkoutSet(b.id, {
        reps: b.reps,
        weight: b.weight,
        setNumber: setIndex + 1,
        workoutExerciseId: selectedExercise.id
      });
    } else {
      await createWorkoutSet({
        reps: b.reps,
        weight: b.weight,
        setNumber: setIndex + 1,
        workoutExerciseId: selectedExercise.id
      });
    }
  }

  setMessage(`Serie ${setIndex + 1} guardada`);
  setMessageType("success");
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

{selectedExerciseIds.length === 0 ? (

<Typography textAlign="center" color="text.secondary">
No hay ejercicios seleccionados
</Typography>

) : (

displayedExercises.map((ex)=>(
  <GymCard
    key={ex.id}
    onClick={() => setSelectedExercise(ex)}
    align="center"
    sx={{ height: 150 }}
  >
    <Stack
      direction={ex.icon ? "row" : "column"} // 👈 cambia layout
      alignItems="center"
      justifyContent="center"
      spacing={ex.icon ? 3 : 1}
      sx={ex.icon ? { transform: "translateX(-20px)" } : {}}
    >

      {/* ICONO */}
      {ex.icon && (
        <img
          src={getExerciseIconUrl(ex.icon)}
          style={{
            width: 120,
            height: 120,
            objectFit: "contain",
            padding: "6px"
          }}
        />
      )}

      {/* TEXTO */}
      <Stack
        spacing={0.5}
        alignItems={ex.icon ? "flex-start" : "center"}
        textAlign={ex.icon ? "left" : "center"}
      >

        <Typography variant="h5" fontWeight={700}>
          {ex.exerciseName ?? ex.exercise?.name ?? "Ejercicio"}
        </Typography>

        <Typography fontSize="1.1rem" color="text.secondary">
          Peso: {ex.weight ?? 0} kg • Reps: {reps ?? "-"}
        </Typography>

        {ex.completed && (
          <Typography variant="h6" color="success.main" fontWeight={700}>
            ✔ Completado
          </Typography>
        )}

      </Stack>

    </Stack>
  </GymCard>
))

)}

</Stack>

<Snackbar
  open={!!message}
  autoHideDuration={3000}
  onClose={()=>setMessage("")}
  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
>
  <Alert severity={messageType} sx={{ width: "100%" }}>
    {message}
  </Alert>
</Snackbar>

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

<DialogTitle sx={{fontWeight:700, textAlign:"center"}}>
{selectedExercise?.exercise?.name || selectedExercise?.exerciseName}
</DialogTitle>

<DialogContent>


<Stack spacing={2} alignItems="center" textAlign="center">

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

{selectedExercise?.exerciseMuscle &&

<MuscleChips muscles={[selectedExercise.exerciseMuscle]} />

}

{selectedExercise?.comment &&

<Typography color="text.secondary">
Comentario: {selectedExercise.comment}
</Typography>

}

</Stack>

<Stack spacing={3} sx={{ mt: 3 }}>

{sets.map((set, setIndex) => (

  <Box key={setIndex} sx={{ border: "1px solid #ddd", p:2, borderRadius:2 }}>

    <Typography fontWeight={700}>
      Serie {setIndex + 1}
    </Typography>

    <Stack spacing={1} mt={1}>

      {set.map((block, blockIndex) => (

        <Stack direction="row" spacing={1} key={blockIndex} alignItems="center">

          <TextField
            label="Reps"
            size="small"
            value={block.reps}
            onChange={(e)=>handleChange(setIndex, blockIndex, "reps", e.target.value)}
            sx={{ width: 80 }}
          />

          <TextField
            label="Peso"
            size="small"
            value={block.weight}
            onChange={(e)=>handleChange(setIndex, blockIndex, "weight", e.target.value)}
            sx={{ width: 90 }}
          />

          <Button onClick={()=>addBlock(setIndex)}>+</Button>

          {set.length > 1 && (
            <Button onClick={()=>removeBlock(setIndex, blockIndex)}>-</Button>
          )}

        </Stack>

      ))}

      <Button
        variant="contained"
        onClick={()=>saveSet(setIndex)}
      >
        Guardar serie {setIndex + 1}
      </Button>

    </Stack>

  </Box>

))}

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
 maxWidth="md"
>
<DialogTitle sx={{fontWeight:700}}>
Seleccionar ejercicios
</DialogTitle>

<DialogContent
  sx={{
    maxHeight: "60vh",
    overflowY: "auto"
  }}
>

  {!isAbdominal && (
    <Tabs value={filterType} onChange={(e, val) => setFilterType(val)}>
      <Tab label="Todos" value="ALL" />
      <Tab label="Primario" value="PRIMARY" />
      <Tab label="Secundario" value="SECONDARY" />
      <Tab label="Terciario" value="TERTIARY" />
      <Tab label="Abdominal" value="ABDOMINAL" />
    </Tabs>
  )}


<Stack spacing={1}>
{filteredExercises.map((ex)=>{
 const isSelected = selectedExerciseIds.includes(ex.id);
 return (
 <Box
  key={ex.id}
  onClick={() => {
  if (ex.completed) return;
  toggleSelectedExercise(ex);
}}
  sx={{
    p:2,
    borderRadius:2,
    border: `2px solid ${isSelected ? "#4caf50" : "#ddd"}`,
    cursor: ex.completed ? "not-allowed" : "pointer", // 👈
    opacity: ex.completed ? 0.6 : 1, // 👈
    backgroundColor: isSelected ? "rgba(76, 175, 80, 0.08)" : "#fff"
  }}
 >
  <Typography fontWeight={700}>
    {ex.exerciseName ?? ex.exercise?.name ?? "Ejercicio"}
  </Typography>

  <Typography variant="body2" color="text.secondary">
    {formatExerciseType(ex.type)} 
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
   setDisplayedExercises(chosen);
   setSelectedExerciseIds(chosen.map((ex)=>ex.id));
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