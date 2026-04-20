import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import backgroundImg from "../assets/gymproIcon.png";
import { muscleLabels } from "../config/muscleConfig"

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

import { checkPersonalRecord } from "../services/personalRecordService";

import GymCard from "../components/GymCard";
import BackButton from "../components/BackButton";
import MuscleChips from "../components/MuscleChips";
import PrimaryButton from "../components/PrimaryButton";
import CloseButton from "../components/CloseButton";
import AnimatedDialog from "../components/AnimatedDialog";

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

const [alertExercises, setAlertExercises] = useState([]);
const [alertModalOpen, setAlertModalOpen] = useState(false);

const [savingSets, setSavingSets] = useState({});
const savingSetsRef = useRef({});
const lastSaveTimeRef = useRef({});
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

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

  //Ver ejercicios con alertas
  const overdueExercises = exercises.filter(
    ex => ex.alert && ex.alert.overdue && !ex.selected
  );

  setAlertExercises(overdueExercises);

  //Abrir modal solo si hay
  if (overdueExercises.length > 0) {
    setAlertModalOpen(true);
  }


  const selectedIds = workoutDayData.selectedExerciseIds ?? [];

  //REAR MAPA (PRO)
  const exerciseMap = new Map(exercises.map(ex => [ex.id, ex]));

  const selected = selectedIds
    .map(id => exerciseMap.get(id))
    .filter(Boolean);

  setSelectedExerciseIds(selectedIds);
  setDisplayedExercises(selected);

};

const formatDate = (date) => {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
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

  const weights = sets
    .flat()
    .map(s => Number(s.weight))
    .filter(w => !isNaN(w) && w > 0);

  if(weights.length > 0){
    const maxWeight = Math.max(...weights);

    await checkPersonalRecord(userId, pendingExercise.exerciseId, maxWeight);
  }

  setWeightModalOpen(false);
  setPendingExercise(null);
  setSelectedExercise(null);
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

  const now = Date.now();

  // ⛔ evitar doble ejecución muy rápida
  if (now - (lastSaveTimeRef.current[setIndex] || 0) < 300) {
    return;
  }

  lastSaveTimeRef.current[setIndex] = now;

  if (savingSetsRef.current[setIndex]) return;

  const blocks = sets[setIndex];

  const existing =
    existingSets ??
    (await getWorkoutSetsByWorkoutExercise(selectedExercise.id));

  const setNumber = setIndex + 1;

  const existingForSet = existing.filter(
    (s) => s.setNumber === setNumber
  );

  const currentIds = blocks.map((b) => b.id).filter(Boolean);

  const toDelete = existingForSet.filter(
    (s) => !currentIds.includes(s.id)
  );

  const allEmpty = blocks.every((b) => !b.reps && !b.weight);
  const allFull = blocks.every((b) => b.reps && b.weight);

  // ❌ mezcla inválida
  if (!allEmpty && !allFull) return;

  // 🔥 detectar cambios reales
  const hasChanges =
    toDelete.length > 0 ||
    blocks.some((b) => {
      if (!b.id) return b.reps || b.weight;

      const original = existingForSet.find((s) => s.id === b.id);
      if (!original) return true;

      return (
        String(original.reps) !== String(b.reps) ||
        String(original.weight) !== String(b.weight)
      );
    });

  // 🚫 NO HAY CAMBIOS → SALIR SIN MOSTRAR NADA
  if (!hasChanges) return;

  // 🔥 RECIÉN ACÁ activás loading
  savingSetsRef.current[setIndex] = true;
  setSavingSets((prev) => ({ ...prev, [setIndex]: true }));

  try {

    const startTime = Date.now();

    // DELETE
    for (const d of toDelete) {
      await deleteWorkoutSet(d.id);
    }

    // EMPTY
    if (allEmpty) {
      for (const b of blocks) {
        if (b.id) await deleteWorkoutSet(b.id);
      }
      return;
    }

    // SAVE
    for (const b of blocks) {
      if (b.id) {
        await updateWorkoutSet(b.id, {
          reps: b.reps,
          weight: b.weight,
          setNumber,
          workoutExerciseId: selectedExercise.id
        });
      } else {
        const created = await createWorkoutSet({
          reps: b.reps,
          weight: b.weight,
          setNumber,
          workoutExerciseId: selectedExercise.id
        });

        b.id = created.id;
      }
    }

    const elapsed = Date.now() - startTime;
    if (elapsed < 600) await delay(600 - elapsed);

  } finally {
    savingSetsRef.current[setIndex] = false;
    setSavingSets((prev) => ({ ...prev, [setIndex]: false }));
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

const handleAutoSave = (setIndex) => {
  saveSet(setIndex, false);
};

const handleCloseExerciseModal = async () => {
  // 🔥 guardar todas las series válidas
  for (let i = 0; i < sets.length; i++) {
    if (savingSetsRef.current[i]) continue;
    await saveSet(i, false);
  }

  setSelectedExercise(null);
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

<AnimatedDialog
  open={!!selectedExercise}
  onClose={handleCloseExerciseModal}
  title={selectedExercise?.exercise?.name || selectedExercise?.exerciseName}
  maxWidth={false}
  titleSize="2rem"
  headerSx={{py: 1.5}}
  paperSx={{width: {xs: "95%", md: "80%"}, maxWidth: "900px"}}
  actions={
    <Button
      fullWidth
      size="large"
      variant="contained"
      color={selectedExercise?.completed ? "error" : "success"}
      onClick={() => handleCompleteClick(selectedExercise)}
      sx={{ fontWeight: 700 }}
      disabled={!areSetsValid()}
    >
      {selectedExercise?.completed
        ? "Quitar completado"
        : "Marcar como completado"}
    </Button>
  }
>

  {/* MEDIA */}
  {selectedExercise?.video ? (
    <video
      controls
      src={getExerciseVideoUrl(selectedExercise.video)}
      style={{
        width: "100%",
        maxHeight: "260px",
        objectFit: "contain",
        background: "#000",
        borderRadius: "8px"
      }}
    />
  ) : selectedExercise?.image ? (
    <img
      src={getExerciseImageUrl(selectedExercise.image)}
      style={{
        width: "100%",
        maxHeight: "260px",
        objectFit: "contain",
        background: "#000",
        borderRadius: "8px"
      }}
    />
  ) : null}

  <Stack spacing={2} alignItems="center" textAlign="center" mt={2}>
    <Typography fontSize={"1.5em"}>
      Peso: <b>{selectedExercise?.weight ?? 0} kg</b>
    </Typography>

    <Typography fontSize={"1.5em"}>
      Repeticiones: <b>{reps ?? "-"}</b>
    </Typography>

    {selectedExercise?.exerciseMuscle && (
      <MuscleChips
        muscles={[selectedExercise.exerciseMuscle]}
        size="medium"
        chipSx={{
          fontSize: "1.4rem",
          fontWeight: 700,
          height: 36,
          px: 1.5
        }}
      />
    )}

    {selectedExercise?.description && (
      <Typography fontSize={"1.5em"} color="text.secondary">
        {selectedExercise.description}
      </Typography>
    )}
  </Stack>

  <Stack spacing={3} sx={{ mt: 3 }}>
    {sets.map((set, setIndex) => {
      const allEmpty = set.every(b => !b.reps && !b.weight);
      const allFull = set.every(b => b.reps && b.weight);
      const isInvalid = !allEmpty && !allFull;
      const hasData = set.some(b => b.id);

      return (
        <Box
          key={setIndex}
          sx={{
            border: "1px solid #ddd",
            p: 2,
            borderRadius: 2
          }}
        >
          <Typography sx={{fontWeight: 700, fontSize: "1.4rem"}}>
            Serie {setIndex + 1}
          </Typography>

          <Typography
            sx={{
              fontSize: "1.4rem",
              color: "text.secondary",
              mt: 0.5
            }}
          >
            {savingSets[setIndex] ? "Guardando..." : ""}
          </Typography>

          <Stack spacing={1} mt={1}>
            {set.map((block, blockIndex) => (
              <Stack
                direction="row"
                spacing={1}
                key={blockIndex}
                alignItems="center"
              >
                <TextField
                  label="Reps"
                  size="small"
                  value={block.reps}
                  disabled={selectedExercise?.completed}
                  onChange={(e) =>
                    handleChange(setIndex, blockIndex, "reps", e.target.value)
                  }
                  onBlur={() => handleAutoSave(setIndex)}
                  sx={{ width: 100, 
                    // input
                    "& .MuiInputBase-input": {
                      fontSize: "1.5rem",
                      paddingTop: "12px",
                      paddingBottom: "4px"
                    },

                    // label normal
                    "& .MuiInputLabel-root": {
                      fontSize: "1.5rem"
                    },

                    // 🔥 label cuando sube (con valor)
                    "& .MuiInputLabel-root.MuiInputLabel-shrink": {
                      fontSize: "1.6rem"
                    },

                    "& .MuiInputBase-root": {
                      height: 65
                    }
                  }}
                />

                <TextField
                  label="Peso"
                  size="small"
                  value={block.weight}
                  disabled={selectedExercise?.completed}
                  onChange={(e) =>
                    handleChange(setIndex, blockIndex, "weight", e.target.value)
                  }
                  onBlur={() => handleAutoSave(setIndex)}
                  sx={{ width: 100,
                    // input
                    "& .MuiInputBase-input": {
                      fontSize: "1.5rem",
                      paddingTop: "12px",
                      paddingBottom: "4px"
                    },

                    // label normal
                    "& .MuiInputLabel-root": {
                      fontSize: "1.5rem"
                    },

                    // 🔥 label cuando sube (con valor)
                    "& .MuiInputLabel-root.MuiInputLabel-shrink": {
                      fontSize: "1.6rem"
                    },

                    "& .MuiInputBase-root": {
                      height: 65
                    }
                  }}
                />

                <Button
                  onClick={() => addBlock(setIndex)}
                  disabled={selectedExercise?.completed}
                  sx={{
                      fontSize: "1.8rem",
                      minWidth: 40,
                      height: 57,
                      lineHeight: 1
                    }}
                >
                  +
                </Button>

                {set.length > 1 && (
                  <Button
                    onClick={() => removeBlock(setIndex, blockIndex)}
                    disabled={selectedExercise?.completed}
                    sx={{
                      fontSize: "2rem",
                      minWidth: 40,
                      height: 57,
                      lineHeight: 1
                    }}
                  >
                    -
                  </Button>
                )}
              </Stack>
            ))}

            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={() => deleteSet(setIndex)}
              disabled={!hasData || selectedExercise?.completed}
              sx={{fontSize: "1.2rem", py: 1.2}}
            >
              Eliminar
            </Button>
          </Stack>
        </Box>
      );
    })}
  </Stack>

</AnimatedDialog>







{/* MODAL DE SELECCIÓN DE EJERCICIOS */}

<AnimatedDialog
  open={isSelectionModalOpen}
  onClose={() => setIsSelectionModalOpen(false)}
  title="Seleccionar ejercicios"
  titleSize="2rem"
  headerSx={{py: 1.5}}
  maxWidth={false}
  paperSx={{
    width: { xs: "95%", md: "80%" },
    maxWidth: "900px"
  }}
  actions={
    <Button
      fullWidth
      variant="contained"
      onClick={() => {
        const chosen = allExercises.filter((ex) =>
          selectedExerciseIds.includes(ex.id)
        );
        setDisplayedExercises(chosen);
        setSelectedExerciseIds(chosen.map((ex) => ex.id));
        setIsSelectionModalOpen(false);
      }}
      sx={{ mt: 1 }}
    >
      Seleccionar ejercicios
    </Button>
  }
>
  <Box
    sx={{
      maxHeight: "60vh",
      overflowY: "auto"
    }}
  >

    {!isAbdominal && (
      <Stack spacing={1} mb={1}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Tabs
            value={filterType}
            onChange={(e, val) => setFilterType(val)}
            sx={{
              "& .MuiTabs-flexContainer": { justifyContent: "center" },
              "& .MuiTab-root": { fontSize: "1.1rem" }
            }}
          >
            <Tab label="Todos" value="ALL" />
            <Tab label="Primario" value="PRIMARY" />
            <Tab label="Secundario" value="SECONDARY" />
            <Tab label="Terciario" value="TERTIARY" />
            <Tab label="Abdominal" value="ABDOMINAL" />
          </Tabs>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Tabs
            value={filterMuscle}
            onChange={(e, val) => setFilterMuscle(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": { mb: 1, fontSize: "1.1rem" }
            }}
          >
            {availableMuscles.map((muscle) => (
              <Tab
                key={muscle}
                value={muscle}
                label={
                  muscle === "ALL"
                    ? "Todos"
                    : muscleLabels[muscle] || muscle
                }
              />
            ))}
          </Tabs>
        </Box>
      </Stack>
    )}

    <Stack spacing={1}>
      {filteredExercises.map((ex) => {
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
              backgroundColor: isSelected
                ? "rgba(76, 175, 80, 0.08)"
                : "#fff",

              position: "relative",
              display: "flex",
              alignItems: "flex-start",
              gap: 2
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
              <Typography fontWeight={700} fontSize={"1.4rem"}>
                {ex.exerciseName ?? ex.exercise?.name ?? "Ejercicio"}
              </Typography>

              <Typography
                color="text.secondary"
                fontWeight={600}
                fontSize={"1.05rem"}
              >
                {formatExerciseType(ex.type)}
              </Typography>

              <Typography fontSize={"1.1rem"}>
                Peso: {ex.weight ?? 0} kg • Reps: {reps ?? "-"}
              </Typography>
            </Box>

            <Box
              sx={{
                minWidth: "120px",
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
  </Box>

</AnimatedDialog>







{/* MODAL ABDOMINALES */}

<AnimatedDialog
  open={confirmFinish}
  onClose={() => setConfirmFinish(false)}
  title="Finalizar día"
  titleSize="2rem"
  paperSx={{
    maxWidth: 600, // 👈 ancho tipo modal chico como antes
    borderRadius: 3
  }}
>
  {/* CONTENIDO */}
  <Box sx={{ pb: 2}}>
    
    <Typography
      sx={{
        fontSize: "1.4rem",
        fontWeight: 500,
        textAlign: "center",
        mb: 4 // 🔥 espacio igual al DialogContent original
      }}
    >
      ¿Querés hacer abdominales antes de terminar la rutina?
    </Typography>

    {/* BOTONES */}
    <Stack direction="row" spacing={4} justifyContent="center">
  
      <Button
        onClick={finishDay}
        variant="outlined"
        sx={{
          minWidth: 80,
          px: 2,
          py: 1, // 🔥 menos alto
          fontSize: "1.4rem",
          textTransform: "none",
          borderRadius: 2
        }}
      >
        No
      </Button>

      <Button
        variant="contained"
        onClick={finishDayWithAbs}
        sx={{
          px: 2.5,
          py: 1, // 🔥 menos alto
          fontSize: "1.4rem",
          fontWeight: 700,
          textTransform: "none",
          borderRadius: 2,
          whiteSpace: "nowrap" // 🔥 evita salto de línea
        }}
      >
        Sí, agregar abdominales
      </Button>

    </Stack>

  </Box>
</AnimatedDialog>



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
      sx={{
        // input
        "& .MuiInputBase-input": {
          fontSize: "1.5rem",
          paddingTop: "12px",
          paddingBottom: "4px"
        },

        // label normal
        "& .MuiInputLabel-root": {
          fontSize: "1.5rem"
        },

        // 🔥 label cuando sube (con valor)
        "& .MuiInputLabel-root.MuiInputLabel-shrink": {
          fontSize: "1.6rem"
        },

        "& .MuiInputBase-root": {
          height: 65
        }
      }}
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


{/*MODAL ALERTAS*/}
<Dialog
  open={alertModalOpen}
  onClose={() => setAlertModalOpen(false)}
  fullWidth
  maxWidth="md"
  PaperProps={{
    sx: {
      width: "90%",
      maxWidth: "900px"
    }
  }}
>
  <DialogTitle sx={{ fontWeight: 700, textAlign: "center" }}>
    ⚠️ Hace tiempo que no hacés estos ejercicios
  </DialogTitle>

  <DialogContent>
    <Typography
      sx={{
        textAlign: "center",
        mb: 2,
        fontSize: "1.5rem"
      }}
    >
      Intentalos incluir hoy 💪
    </Typography>

    <Stack spacing={2}>
      {alertExercises.map((ex) => (
        <Box
          key={ex.id}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid #ddd"
          }}
        >
          <Typography fontWeight={700} fontSize="1.7rem">
            {ex.exerciseName}
          </Typography>

          <Typography fontSize="1.5rem" color="text.secondary">
            Última vez: {formatDate(ex.alert.lastPerformedDate)}
          </Typography>

          <Typography fontSize="1.45rem" color="error">
            Hace {ex.alert.weeksSinceLastPerformed}{" "}
            {ex.alert.weeksSinceLastPerformed === 1 ? "semana" : "semanas"} que no lo hacés
          </Typography>
        </Box>
      ))}
    </Stack>
  </DialogContent>

  <DialogActions>
    <Button
      onClick={() => setAlertModalOpen(false)}
      fullWidth
      variant="contained"
    >
      Entendido
    </Button>
  </DialogActions>
</Dialog>

</Container>

</Box>

);

}