import { useState, useEffect } from "react";

import { getUsers, getCurrentWorkout, setCurrentWorkout, getUserById } from "../services/userService";
import { getExercises } from "../services/exerciseService";
import { getWorkoutTemplates, getWorkoutTemplateById, getWorkoutTemplateDayImageUrl } from "../services/workoutTemplateService";
import { createWorkout, updateWorkout, getWorkoutById } from "../services/workoutService";
import { uploadWorkoutDayImage, deleteWorkoutDayImage, getWorkoutDayImageUrl, deleteWorkoutDayImageByFilename } from "../services/workoutDayService";

import {
Container,
Paper,
Typography,
TextField,
MenuItem,
Button,
Stack,
Card,
CardContent,
IconButton,
FormControlLabel,
Checkbox,
Accordion,
AccordionSummary,
AccordionDetails,
Divider,
Alert,
Snackbar,
Autocomplete,
LinearProgress,
Box
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FileCopyIcon from "@mui/icons-material/FileCopy";

import BackButton from "../components/BackButton";
import MuscleChips from "../components/MuscleChips";
import FileUploadField from "../components/FileUploadField";


export default function CreateWorkoutScreen(){

const [users,setUsers] = useState([]);
const [templates,setTemplates] = useState([]);
const [exercises,setExercises] = useState([]);

const [selectedUser,setSelectedUser] = useState("");
const [source,setSource] = useState("empty");

const [workoutName,setWorkoutName] = useState("");
const [days,setDays] = useState([]);
const [gymDaysPerWeek,setGymDaysPerWeek] = useState(0);

const [selectedExercises,setSelectedExercises] = useState({});

const [startDate,setStartDate] = useState("");
const [endDate,setEndDate] = useState("");

const [workoutId,setWorkoutId] = useState(null);
const [hasCurrentWorkout,setHasCurrentWorkout] = useState(false);
const [isLastWorkout,setIsLastWorkout] = useState(false);

const [message,setMessage] = useState("");
const [messageType,setMessageType] = useState("info");

const [globalReps,setGlobalReps] = useState("");

const repOptions = [
 { label:"8", value:8 },
 { label:"12", value:12 },
 { label:"15", value:15 }
];

const exercisesById = Object.fromEntries(
 exercises.map(ex => [ex.id, ex])
);

useEffect(()=>{
 loadUsers();
 loadTemplates();
 loadExercises();
},[]);

const validateWorkout = () => {

 if(!workoutName.trim()){
  setMessage("El nombre de la plantilla es obligatorio");
  setMessageType("warning");
  return false;
 }

 if(!startDate || !endDate){
  setMessage("Debes seleccionar fecha de inicio y fin");
  setMessageType("warning");
  return false;
 }

 if(!globalReps){
  setMessage("Debes seleccionar las repeticiones del workout");
  setMessageType("warning");
  return false;
 }

 if(days.length === 0){
  setMessage("Debes agregar al menos un día");
  setMessageType("warning");
  return false;
 }

 if(gymDaysPerWeek && days.length > gymDaysPerWeek){
  setMessage(`La planilla tiene ${days.length} días pero el usuario solo entrena ${gymDaysPerWeek}`);
  setMessageType("warning");
  return false;
 }

 for(let d=0; d<days.length; d++){

  const day = days[d];

  if(!day.name.trim()){
   setMessage(`El día ${d+1} debe tener nombre`);
   setMessageType("warning");
   return false;
  }

  if(day.exercises.length === 0){
   setMessage(`El día ${d+1} debe tener al menos un ejercicio`);
   setMessageType("warning");
   return false;
  }

  for(let e=0; e<day.exercises.length; e++){

   const ex = day.exercises[e];

   if(ex.weight === "" || ex.weight === null){
    setMessage(`Un ejercicio del día ${d+1} necesita peso`);
    setMessageType("warning");
    return false;
   }

  }

 }

 setMessage("");
 return true;
};

const resetForm = () => {
 setSource("empty");
 setWorkoutName("");
 setDays([]);
 setStartDate("");
 setEndDate("");
 setWorkoutId(null);
 setIsLastWorkout(false);
 setGlobalReps("");
 setSelectedExercises({});
};

const loadUsers = async()=>{
 const data = await getUsers();
 setUsers(data);
};

const loadTemplates = async()=>{
 const data = await getWorkoutTemplates();
 setTemplates(data);
};

const loadExercises = async()=>{
 const data = await getExercises();
 setExercises(data);
};

const calculateDayMuscles = (dayExercises) => {

  const musclesSet = new Set();

  dayExercises.forEach(ex => {
    const fullExercise = exercises.find(e => e.id === ex.exerciseId);

    if (fullExercise?.muscle) {
      musclesSet.add(fullExercise.muscle);
    }
  });

  return Array.from(musclesSet);
};

const checkCurrentWorkout = async(userId)=>{
 try{
  const workout = await getCurrentWorkout(userId);
  setHasCurrentWorkout(!!workout);
 }catch{
  setHasCurrentWorkout(false);
 }
};

const loadTemplate = async(id)=>{

 const template = await getWorkoutTemplateById(id);

 setIsLastWorkout(false);
 setWorkoutId(null);

 const loadedDays = template.days.map(day=>({

  id:crypto.randomUUID(),
  name:day.name,
  muscles:day.muscles || [],
  dayOrder:day.dayOrder,
  image:null,
  deleteImage:false,
  preview:day.muscleImage ? getWorkoutTemplateDayImageUrl(day.muscleImage) : null,

  exercises:day.exercises.map(ex=>({
   id:crypto.randomUUID(),
   exerciseId:ex.exerciseId,
   order:ex.order,
   weight:""
  }))

 }));

 setDays(loadedDays);
};

const loadLastWorkout = async()=>{

 const workoutBasic = await getCurrentWorkout(selectedUser);
 if(!workoutBasic) return;

 const workout = await getWorkoutById(workoutBasic.id);

 setWorkoutId(workout.id);
 setWorkoutName(workout.name || "");
 setGlobalReps(workout.reps || "");

 setStartDate(workout.startDate?.split("T")[0] || "");
 setEndDate(workout.endDate?.split("T")[0] || "");

 const loadedDays = workout.days.map(day=>({

  id:day.id,
  name:day.name,
  muscles:day.muscles || [],
  dayOrder:day.dayOrder,
  image:null,
  deleteImage:false,
  preview:day.muscleImage ? getWorkoutDayImageUrl(day.muscleImage) : null,

  exercises:day.exercises.sort((a, b) => a.order - b.order).map(ex=>({
   id:crypto.randomUUID(),
   exerciseId:ex.exerciseId,
   order:ex.order,
   weight:ex.weight
  }))

 }));

 setDays(loadedDays);
 setIsLastWorkout(true);
};

const handleSourceChange = async(value)=>{

 setSource(value);

 if(value==="empty"){
  setDays([]);
  setWorkoutName("");
  setWorkoutId(null);
  setIsLastWorkout(false);
 }

 if(value==="last"){
  await loadLastWorkout();
 }

 if(value.startsWith("template")){
  const id=value.split("-")[1];
  await loadTemplate(id);
 }

};

const addDay = ()=>{

 setDays([
  ...days,
  {
   id:crypto.randomUUID(),
   name:`Día ${days.length+1}`,
   muscles:[],
    exercises:[],
    image:null,
    deleteImage:false,
    preview:null
  }
 ]);

};

const removeDay=(index)=>{

 const updated=[...days];
 updated.splice(index,1);
 setDays(updated);

};

const moveDay=(index,direction)=>{

 const updated=[...days];
 const newIndex=index+direction;

 if(newIndex<0 || newIndex>=updated.length) return;

 [updated[index],updated[newIndex]]=[updated[newIndex],updated[index]];

 setDays(updated);

};

const updateDayField=(index,field,value)=>{

 const updated=[...days];
 updated[index][field]=value;
 setDays(updated);

};

const addExerciseToDay=(dayIndex)=>{

 const selected = selectedExercises[dayIndex];
 if(!selected) return;

 const updated=[...days];

 updated[dayIndex].exercises.push({
  id:crypto.randomUUID(),
  exerciseId:selected.id,
  order:updated[dayIndex].exercises.length+1,
  weight:""
 });

 updated[dayIndex].muscles = calculateDayMuscles(updated[dayIndex].exercises);

 setDays(updated);

 setSelectedExercises(prev=>({
  ...prev,
  [dayIndex]:null
 }));

};

const removeExerciseFromDay=(dayIndex,exIndex)=>{

 const updated=[...days];

 updated[dayIndex].exercises.splice(exIndex,1);

 updated[dayIndex].exercises=
 updated[dayIndex].exercises.map((ex,i)=>({
  ...ex,
  order:i+1
 }));

 updated[dayIndex].muscles = calculateDayMuscles(updated[dayIndex].exercises);

 setDays(updated);

};

const moveExercise=(dayIndex,exIndex,direction)=>{

 const updated=[...days];
 const exercises=updated[dayIndex].exercises;

 const newIndex=exIndex+direction;

 if(newIndex<0 || newIndex>=exercises.length) return;

 [exercises[exIndex],exercises[newIndex]]=[exercises[newIndex],exercises[exIndex]];

 exercises.forEach((ex,i)=>ex.order=i+1);

 updated[dayIndex].muscles = calculateDayMuscles(updated[dayIndex].exercises);

 setDays(updated);

};

const updateExerciseField=(dayIndex,exIndex,field,value)=>{

 const updated=[...days];

 updated[dayIndex].exercises[exIndex][field]=value;

 setDays(updated);

};

const duplicateDay = (index) => {

 const dayToCopy = days[index];

 const newDay = {
  id:crypto.randomUUID(),
  name: dayToCopy.name + " copia",
  muscles: [...dayToCopy.muscles],
  image: null,
  deleteImage: false,
  preview: null,
  exercises: dayToCopy.exercises.map(ex => ({
    ...ex,
    id:crypto.randomUUID()
  }))
 };

 const updated = [...days];

 updated.splice(index + 1, 0, newDay);

 setDays(updated);

};

const handleCreateWorkout = async()=>{

 if(!validateWorkout()) return;

 try{

  const workoutData={
   name:workoutName,
    reps:Number(globalReps),
    userId:Number(selectedUser),
   startDate,
   endDate,
   days:days.map((day, index)=>({
    name:day.name,
    exercises:day.exercises.map(ex=>({
     exerciseId:ex.exerciseId,
     weight:ex.weight,
     order:ex.order
    })),
    dayOrder:index+1
   }))
  };

  const newWorkout = await createWorkout(workoutData);

  await setCurrentWorkout(Number(selectedUser), newWorkout.id);

    const fullWorkout = await getWorkoutById(newWorkout.id);

    for (let i = 0; i < fullWorkout.days.length; i++) {
     const backendDay = fullWorkout.days[i];
     const frontDay = days[i];

     if (frontDay?.image) {
      await uploadWorkoutDayImage(backendDay.id, frontDay.image);
     } else if (frontDay?.preview && !frontDay.deleteImage) {
      const response = await fetch(frontDay.preview);
      const blob = await response.blob();
      const file = new File([blob], "day-image.jpg", { type: blob.type || "image/jpeg" });
      await uploadWorkoutDayImage(backendDay.id, file);
     }
    }

  resetForm();

  setMessage("Planilla creada");
  setMessageType("success");

 }catch(e){
  setMessage(e.message);
  setMessageType("error");
 }

};

const handleUpdateWorkout = async()=>{

 if(!validateWorkout()) return;

 try{

  const existingWorkout = await getWorkoutById(workoutId);
  const oldImages = existingWorkout.days
   .map((day) => day.muscleImage)
   .filter(Boolean);

  const workoutData={
   name:workoutName,
    reps:Number(globalReps),
    userId: Number(selectedUser),
   startDate,
   endDate,
   days:days.map((day, index)=>({
    name:day.name,
    exercises:day.exercises.map(ex=>({
     exerciseId:ex.exerciseId,
     weight:ex.weight,
     order:ex.order
    })),
    dayOrder:index+1
   }))
  };

  await updateWorkout(workoutId,workoutData);

  const fullWorkout = await getWorkoutById(workoutId);

  for (let i = 0; i < fullWorkout.days.length; i++) {
   const backendDay = fullWorkout.days[i];
   const frontDay = days[i];

   if (frontDay?.image) {
    await uploadWorkoutDayImage(backendDay.id, frontDay.image);
   } else if (frontDay?.deleteImage) {
    await deleteWorkoutDayImage(backendDay.id);
   } else if (frontDay?.preview) {
    const response = await fetch(frontDay.preview);
    const blob = await response.blob();
    const file = new File([blob], "day-image.jpg", { type: blob.type || "image/jpeg" });
    await uploadWorkoutDayImage(backendDay.id, file);
   }
  }

  for (const image of oldImages) {
   await deleteWorkoutDayImageByFilename(image);
  }

  resetForm();

  setMessage("Planilla actualizada");
  setMessageType("success");

 }catch(e){
  setMessage(e.message);
  setMessageType("error");
 }

};

return(

<Container maxWidth="md" sx={{mt:4,mb:6}}>

<Paper sx={{p:4}}>

<Box
  sx={{
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mb: 2
  }}
>

  {/* 🔙 Flecha a la izquierda */}
  <Box sx={{ position: "absolute", left: 0 }}>
    <BackButton to="/admin" sx={{color: "black"}}/>
  </Box>

  {/* 🧠 Título centrado REAL */}
  <Typography variant="h4" sx={{ transform: "translateY(-2px)" }}>
    Crear Planilla
  </Typography>

</Box>

<Stack spacing={3}>


<TextField
select
label="Usuario"
value={selectedUser}
onChange={async(e)=>{

 const userId=e.target.value;
 setSelectedUser(userId);

 if(userId){

  await checkCurrentWorkout(userId);

  const user = await getUserById(userId);
  setGymDaysPerWeek(user.gymDaysPerWeek || 0);

 }

}}
>

<MenuItem value="" disabled>Seleccionar usuario</MenuItem>

{users.map(u=>(
<MenuItem key={u.id} value={u.id}>
{u.name}
</MenuItem>
))}

</TextField>

{selectedUser && (

<TextField
select
label="Origen"
value={source}
onChange={(e)=>handleSourceChange(e.target.value)}
>

<MenuItem value="empty">Planilla vacía</MenuItem>

{hasCurrentWorkout && (
<MenuItem value="last">Última planilla</MenuItem>
)}

{templates.map(t=>(
<MenuItem key={t.id} value={`template-${t.id}`}>
{t.name}
</MenuItem>
))}

</TextField>

)}

{gymDaysPerWeek > 0 && (

<Stack spacing={1}>

<Typography
variant="body2"
color={days.length > gymDaysPerWeek ? "error" : "textPrimary"}
>
Días de la planilla: {days.length} / {gymDaysPerWeek}
</Typography>

<LinearProgress
variant="determinate"
color={days.length > gymDaysPerWeek ? "error" : "primary"}
value={Math.min((days.length / gymDaysPerWeek) * 100, 100)}
/>


</Stack>

)}

<TextField
label="Nombre de la planilla"
value={workoutName}
onChange={(e)=>setWorkoutName(e.target.value)}
/>

<Stack direction="row" spacing={2}>

<TextField
type="date"
label="Fecha inicio"
InputLabelProps={{ shrink:true }}
value={startDate}
onChange={(e)=>setStartDate(e.target.value)}
/>

<TextField
type="date"
label="Fecha fin"
InputLabelProps={{ shrink:true }}
value={endDate}
onChange={(e)=>setEndDate(e.target.value)}
/>

<TextField
 select
 label="Repeticiones globales"
 value={globalReps}
 onChange={(e)=>setGlobalReps(e.target.value)}
 sx={{width:202}}
>

{repOptions.map(opt=>(
<MenuItem key={opt.value} value={opt.value}>
{opt.label}
</MenuItem>
))}

</TextField>

</Stack>


{days.map((day,dayIndex)=>(

<Accordion key={dayIndex}>

<AccordionSummary expandIcon={<ExpandMoreIcon/>}>

<Typography>
Día {dayIndex+1} - {day.name}
</Typography>

</AccordionSummary>

<AccordionDetails>

<Stack spacing={2}>

<Stack direction="row" justifyContent="space-between">

<Typography variant="h6">
Configuración del día
</Typography>

<Stack direction="row">

<IconButton onClick={()=>moveDay(dayIndex,-1)}>
<ArrowUpwardIcon/>
</IconButton>

<IconButton onClick={()=>moveDay(dayIndex,1)}>
<ArrowDownwardIcon/>
</IconButton>

<IconButton onClick={()=>duplicateDay(dayIndex)}>
<FileCopyIcon/>
</IconButton>

<IconButton onClick={()=>removeDay(dayIndex)}>
<DeleteIcon color="error"/>
</IconButton>

</Stack>

</Stack>

<TextField
label="Nombre del día"
value={day.name}
onChange={(e)=>updateDayField(dayIndex,"name",e.target.value)}
/>

<MuscleChips muscles={day.muscles} />

<FileUploadField
  label="Imagen del día"
  accept="image/*"
  setFile={(file) => {
    const updated = [...days];
    updated[dayIndex].image = file;
    updated[dayIndex].deleteImage = false;
    setDays(updated);
  }}
  preview={day.preview}
  setPreview={(preview) => {
    const updated = [...days];
    updated[dayIndex].preview = preview;
    updated[dayIndex].deleteImage = false;
    setDays(updated);
  }}
  existingUrl={
    day.preview && !day.preview.startsWith("blob:")
      ? day.preview
      : null
  }
  deleteFlag={day.deleteImage}
  setDeleteFlag={(value) => {
    const updated = [...days];
    updated[dayIndex].deleteImage = value;

    if (value) {
      updated[dayIndex].image = null;
    }

    setDays(updated);
  }}
  renderPreview={(src) => (
    <img
      src={src}
      style={{
        maxWidth: "300px",
        borderRadius: "8px"
      }}
    />
  )}
/>

<Autocomplete
options={exercises}
getOptionLabel={(option)=>option.name}
value={selectedExercises[dayIndex] || null}
onChange={(event,value)=>setSelectedExercises(prev=>({
 ...prev,
 [dayIndex]:value
}))}
renderInput={(params)=>
<TextField {...params} label="Seleccionar ejercicio"/>
}
/>

<Button
variant="contained"
color="success"
onClick={()=>addExerciseToDay(dayIndex)}
>
Agregar ejercicio
</Button>

<Divider/>

{day.exercises.map((ex,i)=>{

const exercise = exercisesById[ex.exerciseId];

return(

<Card key={ex.id}>

<CardContent>

<Stack direction="row" spacing={2} alignItems="center">

<Typography sx={{width:200}}>
{ex.order}. {exercise?.name}
</Typography>

<TextField
type="number"
label="Peso"
size="small"
value={ex.weight}
onChange={(e)=>updateExerciseField(dayIndex,i,"weight",e.target.value)}
/>

<IconButton onClick={()=>moveExercise(dayIndex,i,-1)}>
<ArrowUpwardIcon/>
</IconButton>

<IconButton onClick={()=>moveExercise(dayIndex,i,1)}>
<ArrowDownwardIcon/>
</IconButton>

<IconButton onClick={()=>removeExerciseFromDay(dayIndex,i)}>
<DeleteIcon color="error"/>
</IconButton>

</Stack>

</CardContent>

</Card>

);})}

</Stack>

</AccordionDetails>

</Accordion>

))}

<Button
variant="contained"
color="success"
onClick={addDay}
disabled={!selectedUser || (gymDaysPerWeek && days.length >= gymDaysPerWeek)}
>
Agregar día
</Button>

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

<Stack direction="row" spacing={2}>

{isLastWorkout && (

<Button
variant="contained"
color="success"
onClick={handleUpdateWorkout}
>
Actualizar última planilla
</Button>

)}

<Button
variant="contained"
color="success"
onClick={handleCreateWorkout}
>
Crear nueva planilla
</Button>

</Stack>


</Stack>

</Paper>

</Container>

);
}