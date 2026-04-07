import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import backgroundImg from "../assets/gymproIcon.png";

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
import PrimaryButton from "../components/PrimaryButton";
import CloseButton from "../components/CloseButton";

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

const [weightModalOpen, setWeightModalOpen] = useState(false);
const [nextWeight, setNextWeight] = useState("");
const [pendingExercise, setPendingExercise] = useState(null);

const navigate = useNavigate();

const [confirmFinish,setConfirmFinish] = useState(false);
const [isAbdominal,setIsAbdominal] = useState(false);

const [filterType, setFilterType] = useState("ALL");
const [filterMuscle, setFilterMuscle] = useState("ALL");

const availableMuscles = [
  "ALL",
  ...Array.from(
    new Set(
      allExercises
        .map(ex => ex.exerciseMuscle)
        .filter(Boolean)
    )
  )
];

const [sets, setSets] = useState([
  [{ reps: "", weight: "", id: null }],
  [{ reps: "", weight: "", id: null }],
  [{ reps: "", weight: "", id: null }]
]);

const emptySets = [
  [{ reps: "", weight: "", id: null }],
  [{ reps: "", weight: "", id: null }],
  [{ reps: "", weight: "", id: null }]
];

const muscleLabels = {
  CHEST: "Pecho",
  BACK: "Espalda",
  SHOULDERS: "Hombros",
  BICEPS: "Bíceps",
  TRICEPS: "Tríceps",
  FOREARMS: "Antebrazos",
  QUADRICEPS: "Cuádriceps",
  GLUTES: "Glúteos",
  HAMSTRINGS: "Femorales",
  CALVES: "Gemelos",
  ABDOMINALS: "Abdominales"
};

useEffect(()=>{
 loadData();
},[]);

useEffect(() => {
  if (!selectedExercise) return;

  loadSets();
}, [selectedExercise]);

const loadSets = async () => {
  setSets(emptySets);

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

  const result = [1, 2, 3].map((setNum) => {
    return grouped[setNum] || [{ reps: "", weight: "", id: null }];
  });

  setSets(result);
};

const loadData = async () => {

  const abs = await isAbdominalWorkoutDay(workoutDayId);
  setIsAbdominal(abs);

  const workoutDayData = await getWorkoutDayExercises(workoutDayId);

  setReps(workoutDayData.reps ?? null);

  const exercises = workoutDayData.exercises ?? [];

  setAllExercises(exercises);

  const selectedIds = workoutDayData.selectedExerciseIds ?? [];

  //REAR MAPA (PRO)
  const exerciseMap = new Map(exercises.map(ex => [ex.id, ex]));

  const selected = selectedIds
    .map(id => exerciseMap.get(id))
    .filter(Boolean);

  setSelectedExerciseIds(selectedIds);
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

  // 🔴 día abdominal
  if (isAbdominal && ex.type !== "ABDOMINAL") return false;

  // 🔵 filtro por tipo
  if (filterType !== "ALL" && ex.type !== filterType) return false;

  // 🟢 filtro por músculo
  if (filterMuscle !== "ALL" && ex.exerciseMuscle !== filterMuscle) return false;

  return true;
});



const toggleSelectedExercise = async (ex) => {
  const isSelected = selectedExerciseIds.includes(ex.id);

  let newSelectedIds;

  if (isSelected) {
    await unmarkWorkoutExerciseSelected(workoutDayId, ex.id);
    newSelectedIds = selectedExerciseIds.filter(id => id !== ex.id);
  } else {
    await markWorkoutExerciseSelected(workoutDayId, ex.id);
    newSelectedIds = [...selectedExerciseIds, ex.id];
  }

  const updatedAll = allExercises.map((item) =>
    item.id === ex.id ? { ...item, selected: !isSelected } : item
  );

  //ESTADOS
  setSelectedExerciseIds(newSelectedIds);
  setAllExercises(updatedAll);

  //USAR ORDEN
  const ordered = newSelectedIds
    .map(id => updatedAll.find(ex => ex.id === id))
    .filter(Boolean);

  setDisplayedExercises(ordered);
};

const toggleCompleteExercise = async(ex)=>{

  if (!areSetsValid()) {
    setMessage("Tenés series incompletas");
    setMessageType("error");
    return;
  }

  if (!ex.completed) {

    const existing = await getWorkoutSetsByWorkoutExercise(selectedExercise.id);

    for (let i = 0; i < sets.length; i++) {
      await saveSet(i, false, existing);
    }
    setMessage("Series guardadas automáticamente");
    setMessageType("success");
  }

 let updated;

 if(ex.completed){
  updated = await uncompleteWorkoutExercise(ex.id);
 }else{
  updated = await completeWorkoutExercise(ex.id, nextWeight);
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

const handleCompleteClick = (ex) => {
  if (ex.completed) {
    // comportamiento actual
    toggleCompleteExercise(ex);
    return;
  }

  // abrir modal
  setPendingExercise(ex);
  setNextWeight(ex.weight ?? ""); // placeholder lógico
  setWeightModalOpen(true);
};

const confirmCompleteWithWeight = async () => {
  if (!pendingExercise) return;

  await toggleCompleteExercise(pendingExercise);

  // 🔥 acá después podrías guardar el nextWeight en backend
  // (para progreso futuro)

  setWeightModalOpen(false);
  setPendingExercise(null);
};

const areAllExercisesCompleted = () => {
  if (displayedExercises.length === 0) return false;

  return displayedExercises.every(ex => ex.completed);
};

const handleFinishClick = ()=>{

  if (!areAllExercisesCompleted()) {
    setMessage("Tenés ejercicios sin completar");
    setMessageType("error");
    return;
  }

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

const deleteSet = async (setIndex) => {
  const setNumber = setIndex + 1;

  const existing = await getWorkoutSetsByWorkoutExercise(selectedExercise.id);

  const toDelete = existing.filter(
    s => s.setNumber === setNumber
  );

  for (const s of toDelete) {
    await deleteWorkoutSet(s.id);
  }

  // resetear en UI
  const updated = [...sets];
  updated[setIndex] = [{ reps: "", weight: "", id: null }];
  setSets(updated);

  setMessage(`Serie ${setNumber} eliminada`);
  setMessageType("info");
};

const saveSet = async (setIndex, showMessage = true, existingSets = null) => {
  const blocks = sets[setIndex];

  const existing = existingSets ?? await getWorkoutSetsByWorkoutExercise(selectedExercise.id);

  const currentIds = blocks.map(b => b.id).filter(Boolean);

  const toDelete = existing.filter(
    s => s.setNumber === setIndex + 1 && !currentIds.includes(s.id)
  );

  // 🔴 BORRAR LOS QUE SACASTE CON "-"
  for (const d of toDelete) {
    await deleteWorkoutSet(d.id);
  }

  const allEmpty = blocks.every(b => !b.reps && !b.weight);
  const allFull = blocks.every(b => b.reps && b.weight);

  if (!allEmpty && !allFull) {
    if (showMessage) {
      setMessage("Completá todos los bloques de la serie");
      setMessageType("error");
    }
    return;
  }

  // 🔴 SI TODO VACÍO → BORRAR TODO
  if (allEmpty) {
    for (const b of blocks) {
      if (b.id) await deleteWorkoutSet(b.id);
    }
    if (showMessage) {
      setMessage("Serie eliminada");
      setMessageType("info");
    }
    return;
  }

  // 🟢 GUARDAR / UPDATE
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
  if (showMessage) {
    setMessage(`Serie ${setIndex + 1} guardada`);
    setMessageType("success");
  }
};


const hasValue = (v) => v !== null && v !== "" && v !== undefined;

const areSetsValid = () => {
  let hasAnyData = false;
  let hasAnyEmpty = false;

  for (const set of sets) {
    const allEmpty = set.every(b => !hasValue(b.reps) && !hasValue(b.weight));
    const allFull = set.every(b => hasValue(b.reps) && hasValue(b.weight));

    // ❌ serie inválida (mezcla interna)
    if (!allEmpty && !allFull) return false;

    if (allFull) hasAnyData = true;
    if (allEmpty) hasAnyEmpty = true;
  }

  // ❌ mezcla entre series (unas sí, otras no)
  if (hasAnyData && hasAnyEmpty) return false;

  return true;
};


return(

  <Box
    sx={{
      position: "relative",
      minHeight: "100vh",
      overflow: "hidden"
    }}
  >
  
    {/* 🖼️ BACKGROUND */}
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        zIndex: 0
      }}
    />
  
    {/* 🌑 OVERLAY */}
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(44, 44, 44, 0.4)",
        backdropFilter: "blur(6px)",
        zIndex: 1
      }}
    />

<Container maxWidth="sm" sx={{mt:6, mb:15, zIndex:2, position:"relative"}}>


<Box
  sx={{
    position: "relative",
    mb: 3,
    px: 2,
    py: 1.5,
    borderRadius: 3,
    backdropFilter: "blur(10px)",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.25)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
  }}
>
  <Stack direction="row" alignItems="center">
    
    <BackButton to={`/workout/${userId}`} sx={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }} />

    <Typography
      textAlign="center"
      sx={{
        width: "100%",
        fontWeight: 800,
        fontSize: "1.9rem",
        letterSpacing: "0.8px",
        color: "#fff",
        textShadow: "0 3px 8px rgba(0,0,0,0.7)"
      }}
    >
      Ejercicios del día
    </Typography>

  </Stack>
</Box>

<Stack spacing={2}>

{selectedExerciseIds.length === 0 ? (

<Typography textAlign="center" 
  sx={{
    color: "#fff",
    fontSize: "1.7rem",
    fontWeight: 600,
    textShadow: "0 2px 6px rgba(0,0,0,0.7)",
    letterSpacing: "0.5px"
  }}
>
No hay ejercicios seleccionados
</Typography>

) : (

displayedExercises.map((ex) => (
  <GymCard
    key={ex.id}
    onClick={() => setSelectedExercise(ex)}
    variant="exercise"
    sx={{
      height: 140,
      display: "flex",
      alignItems: "center",
      px: 2,
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{ width: "100%" }}
    >
      {/* 🖼️ ICONO */}
      {ex.icon && (
        <Box
          sx={{
            width: 110,
            height: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <img
            src={getExerciseIconUrl(ex.icon)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </Box>
      )}

      {/* 📊 CONTENIDO */}
      <Box sx={{ flex: 1 }}>
        
        {/* 🔝 FILA: NOMBRE + PESO/REPS */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            fontWeight={700}
            sx={{
              fontSize: "1.5rem",
              lineHeight: 1.2,
            }}
          >
            {ex.exerciseName ?? ex.exercise?.name ?? "Ejercicio"}
          </Typography>

          <Typography
            sx={{
              fontSize: "1.1rem",
              color: "text.secondary",
              fontWeight: 500,
              whiteSpace: "nowrap"
            }}
          >
            Peso: {ex.weight ?? 0} kg • Reps: {reps ?? "-"}
          </Typography>
        </Stack>

        {/* 📏 LINEA */}
        <Box
          sx={{
            width: "100%",
            height: "1px",
            background: "rgba(0,0,0,0.15)",
            my: 1,
          }}
        />

        {/* ✅ COMPLETADO */}
        {ex.completed && (
          <Typography
            sx={{
              fontWeight: 700,
              color: "#2e7d32",
              fontSize: "1.1rem",
            }}
          >
            ✔ Completado
          </Typography>
        )}
      </Box>
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
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",

  background: "linear-gradient(to top, rgba(255,255,255,0.12), rgba(168, 168, 168, 0.02))", // 🔥 super liviano (no oscurece)
  
  borderTop: "1px solid rgba(255,255,255,0.2)",

  boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",

  zIndex: 5
 }}
>

<Stack direction="row" spacing={1}>
  

<PrimaryButton
  label="Seleccionar ejercicios"
  onClick={() => setIsSelectionModalOpen(true)}
  sx={{
    width: "100%",
    fontWeight: 700,
    fontSize: "2rem",
    py: 0.7,
    background: "linear-gradient(145deg, #c35aff, #ba20e9)"
  }}
/>

<PrimaryButton
  label="Finalizar día"
  onClick={handleFinishClick}
  disabled={!areAllExercisesCompleted()}
  sx={{
    width: "100%",
    fontWeight: 700,
    fontSize: "2rem",
    py: 0.7
  }}
/>
</Stack>

</Box>

{/* MODAL EJERCICIO */}

<Dialog
 open={!!selectedExercise}
 onClose={()=>setSelectedExercise(null)}
 fullWidth
 maxWidth="md"
 sx={{
    "& .MuiDialog-paper": {
      width: { xs: "95%", md: "80%" },
      maxWidth: "900px"
    }
  }}
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

<DialogTitle sx={{fontWeight:700, position: "relative", textAlign:"center"}}>
  {selectedExercise?.exercise?.name || selectedExercise?.exerciseName}
  <CloseButton onClick={() => setSelectedExercise(null)}
    sx={{
      position: "absolute",
      right: 16,
      top: "50%",
      transform: "translateY(-50%)",
    }}
  />
  </DialogTitle>

<DialogContent>


<Stack spacing={2} alignItems="center" textAlign="center">

<Typography fontSize={"1.5em"}>
Peso: <b>{selectedExercise?.weight ?? 0} kg</b>
</Typography>

<Typography fontSize={"1.5em"}>
Repeticiones: <b>{reps ?? "-"}</b>
</Typography>

{selectedExercise?.exerciseMuscle &&

<MuscleChips muscles={[selectedExercise.exerciseMuscle]} size="medium" chipSx={{
    fontSize: "1.4rem",
    fontWeight: 700,
    height: 36,
    px: 1.5
  }}/>

}

{selectedExercise?.description &&

<Typography fontSize={"1.5em"} color="text.secondary">
{selectedExercise.description}
</Typography>

}

</Stack>

<Stack spacing={3} sx={{ mt: 3 }}>

{sets.map((set, setIndex) => {

  const allEmpty = set.every(b => !b.reps && !b.weight);
  const allFull = set.every(b => b.reps && b.weight);
  const isInvalid = !allEmpty && !allFull;
  const hasData = set.some(b => b.id);

  return(

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
            disabled={selectedExercise?.completed}
            onChange={(e)=>handleChange(setIndex, blockIndex, "reps", e.target.value)}
            sx={{ width: 80 }}
          />

          <TextField
            label="Peso"
            size="small"
            value={block.weight}
            disabled={selectedExercise?.completed}
            onChange={(e)=>handleChange(setIndex, blockIndex, "weight", e.target.value)}
            sx={{ width: 90 }}
          />

          <Button onClick={()=>addBlock(setIndex)} disabled={selectedExercise?.completed}>+</Button>

          {set.length > 1 && (
            <Button onClick={()=>removeBlock(setIndex, blockIndex)} disabled={selectedExercise?.completed}>-</Button>
          )}

        </Stack>

      ))}

      <Stack direction="row" spacing={1}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => saveSet(setIndex)}
          disabled={allEmpty || isInvalid || selectedExercise?.completed} // 🔥 clave
        >
          Guardar serie {setIndex + 1}
        </Button>

        <Button
          fullWidth
          variant="outlined"
          color="error"
          onClick={() => deleteSet(setIndex)}
          disabled={!hasData || selectedExercise?.completed}
        >
          Eliminar
        </Button>
      </Stack>

    </Stack>

  </Box>

  );
})}

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
 onClick={()=>handleCompleteClick(selectedExercise)}
 sx={{fontWeight:700}}
 disabled={!areSetsValid()}
>
{selectedExercise?.completed
 ? "Quitar completado"
 : "Marcar como completado"}
</Button>



</DialogActions>

</Dialog>

{/* MODAL DE SELECCIÓN DE EJERCICIOS */}

<Dialog
 open={isSelectionModalOpen}
 onClose={()=>setIsSelectionModalOpen(false)}
 fullWidth
 maxWidth="md"
 sx={{
    "& .MuiDialog-paper": {
      width: { xs: "95%", md: "80%" },
      maxWidth: "900px"
    }
  }}
>
<DialogTitle sx={{fontWeight:700, position: "relative", textAlign:"center"}}>
Seleccionar ejercicios
<CloseButton onClick={() => setIsSelectionModalOpen(false)}
  sx={{
    position: "absolute",
    right: 16,
    top: "50%",
    transform: "translateY(-50%)",
  }}
/>
</DialogTitle>

<DialogContent
  sx={{
    maxHeight: "60vh",
    overflowY: "auto"
  }}
>

  {!isAbdominal && (
    <Stack spacing={1} mb={1}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center"
        }}
      >
        <Tabs value={filterType} onChange={(e, val) => setFilterType(val)} 
          sx={{"& .MuiTabs-flexContainer": {justifyContent: "center"}, 
            "& .MuiTab-root": {fontSize: "1.1rem"}
          }}
        >
          <Tab label="Todos" value="ALL" />
          <Tab label="Primario" value="PRIMARY" />
          <Tab label="Secundario" value="SECONDARY" />
          <Tab label="Terciario" value="TERTIARY" />
          <Tab label="Abdominal" value="ABDOMINAL" />
        </Tabs>

      </Box>
      
      <Box
        sx={{
          display: "flex",
          justifyContent: "center"
        }}
       >
        <Tabs
          value={filterMuscle}
          onChange={(e, val) => setFilterMuscle(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {mb:1, fontSize: "1.1rem"}
          }}
        >
          {availableMuscles.map((muscle) => (
            <Tab
              key={muscle}
              value={muscle}
              label={muscle === "ALL" ? "Todos" : muscleLabels[muscle] || muscle}
            />
          ))}
        </Tabs>
      </Box>
    </Stack>
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
    p: 2,
    borderRadius: 2,
    border: `2px solid ${isSelected ? "#4caf50" : "#ddd"}`,
    cursor: ex.completed ? "not-allowed" : "pointer",
    opacity: ex.completed ? 0.6 : 1,
    backgroundColor: isSelected ? "rgba(76, 175, 80, 0.08)" : "#fff",

    position: "relative",
    display: "flex",
    alignItems: "flex-start",
    gap: 2,
  }}
>
  <Box
    component="img"
    src={getExerciseIconUrl(ex.icon)}
    alt={ex.exerciseName}
    sx={{
      width: 100,
      height: 100,
      objectFit: "contain",
      borderRadius: 2,
      p: 0.5,
      flexShrink: 0,
      transform: "translateX(28px)"
    }}
  />

  <Box
    sx={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      mt: 0.5
    }}
  >
    {/* Nombre */}
    <Typography fontWeight={700} fontSize={"1.4rem"}>
      {ex.exerciseName ?? ex.exercise?.name ?? "Ejercicio"}
    </Typography>

    {/* Tipo */}
    <Typography color="text.secondary" fontWeight={600} fontSize={"1.05rem"}>
      {formatExerciseType(ex.type)}
    </Typography>

    {/* Datos */}
    <Typography fontSize={"1.1rem"}>
      Peso: {ex.weight ?? 0} kg • Reps: {reps ?? "-"}
    </Typography>

    
  </Box>

  {/* ✔ COMPLETADO */}
  <Box
    sx={{
      minWidth: "120px", // 👈 reserva espacio SIEMPRE
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "flex-start"
    }}
  >
    <Typography
      sx={{
        fontWeight: 700,
        color: "#2e7d32",
        fontSize: "1.2rem",
        visibility: ex.completed ? "visible" : "hidden"
      }}
    >
      ✔ Completado
    </Typography>
  </Box>
  
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
 sx={{mt:1}}
>
 Seleccionar ejercicios
</Button>
</DialogActions>

</Dialog>

{/* MODAL ABDOMINALES */}

<Dialog
  open={confirmFinish}
  onClose={() => setConfirmFinish(false)}
>
  <DialogTitle sx={{fontWeight:700, position: "relative", textAlign:"center"}}>
  Finalizar día
  <CloseButton onClick={() => setConfirmFinish(false)}
    sx={{
      position: "absolute",
      right: 16,
      top: "50%",
      transform: "translateY(-50%)",
    }}
  />
  </DialogTitle>

  <DialogContent>
    <Typography
      sx={{
        fontSize: "1.4rem",
        fontWeight: 500
      }}
    >
      ¿Querés hacer abdominales antes de terminar la rutina?
    </Typography>
  </DialogContent>

  <DialogActions>
    <Button onClick={finishDay} variant="outlined">
      No
    </Button>

    <Button variant="contained" onClick={finishDayWithAbs}>
      Sí, agregar abdominales
    </Button>
  </DialogActions>
</Dialog>



<Dialog
  open={weightModalOpen}
  onClose={() => setWeightModalOpen(false)}
  fullWidth
  maxWidth="xs"
>
  <DialogTitle sx={{fontWeight:700, position: "relative", textAlign:"center"}}>
  Próxima semana 💪
  <CloseButton onClick={() => setWeightModalOpen(false)}
    sx={{
      position: "absolute",
      right: 16,
      top: "50%",
      transform: "translateY(-50%)",
    }}
  />
  </DialogTitle>

  <DialogContent>
    <Typography
      sx={{
        fontSize: "1.3rem",
        textAlign: "center",
        mb: 2
      }}
    >
      ¿Cuánto peso querés usar la próxima semana?
    </Typography>

    <TextField
      fullWidth
      label="Peso"
      value={nextWeight}
      onChange={(e) => setNextWeight(e.target.value)}
      placeholder={`${pendingExercise?.weight ?? 0}`}
      type="number"
    />
  </DialogContent>

  <DialogActions sx={{ p: 2 }}>
    <Button
      onClick={confirmCompleteWithWeight}
      variant="contained"
      fullWidth
    >
      Guardar y completar
    </Button>
  </DialogActions>
</Dialog>


</Container>

</Box>

);

}