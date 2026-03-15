import { useState, useEffect } from "react";

import { getUsers, getCurrentWorkout, setCurrentWorkout } from "../services/userService";
import { getExercises } from "../services/exerciseService";
import { getWorkoutTemplates, getWorkoutTemplateById } from "../services/workoutTemplateService";
import { createWorkout, updateWorkout, getWorkoutById } from "../services/workoutService";

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
Accordion,
AccordionSummary,
AccordionDetails,
Divider,
Alert,
Autocomplete
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

export default function CreateWorkoutScreen(){

const [users,setUsers] = useState([]);
const [templates,setTemplates] = useState([]);
const [exercises,setExercises] = useState([]);

const [selectedUser,setSelectedUser] = useState("");
const [source,setSource] = useState("empty");

const [workoutName,setWorkoutName] = useState("");
const [days,setDays] = useState([]);

const [startDate,setStartDate] = useState("");
const [endDate,setEndDate] = useState("");

const [workoutId,setWorkoutId] = useState(null);
const [hasCurrentWorkout,setHasCurrentWorkout] = useState(false);
const [isLastWorkout,setIsLastWorkout] = useState(false);

const [message,setMessage] = useState("");

useEffect(()=>{
 loadUsers();
 loadTemplates();
 loadExercises();
},[]);

const resetForm = () => {
 setSource("empty");
 setWorkoutName("");
 setDays([]);
 setStartDate("");
 setEndDate("");
 setWorkoutId(null);
 setIsLastWorkout(false);
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

 const loadedDays = template.days.map(day=>({

  name:day.name,
  muscles:day.muscles,

  exercises:day.exercises.map(ex=>({
   exerciseId:ex.exerciseId,
   exerciseName:ex.exerciseName,
   order:ex.order,
   reps:"",
   weight:""
  })),

  selectedExercise:null

 }));

 setDays(loadedDays);

 setWorkoutName(template.name || "");
 setStartDate("");
 setEndDate("");

 setIsLastWorkout(false);
 setWorkoutId(null);
};

const loadLastWorkout = async()=>{

 const workoutBasic = await getCurrentWorkout(selectedUser);

 if(!workoutBasic){
  setHasCurrentWorkout(false);
  return;
 }

 const workout = await getWorkoutById(workoutBasic.id);

 setWorkoutId(workout.id);

 setWorkoutName(workout.name || "");

 setStartDate(workout.startDate?.split("T")[0] || "");
 setEndDate(workout.endDate?.split("T")[0] || "");

 const loadedDays = workout.days.map(day=>({

  name:day.name,
  muscles:day.muscles,

  exercises:day.exercises.map(ex=>({
   exerciseId:ex.exerciseId,
   exerciseName:ex.exerciseName,
   order:ex.order,
   reps:ex.reps,
   weight:ex.weight
  })),

  selectedExercise:null

 }));

 setDays(loadedDays);
 setIsLastWorkout(true);
};

const handleSourceChange = async(value)=>{

 setSource(value);

 if(value==="empty"){
  setDays([]);
  setWorkoutName("");
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
   name:`Día ${days.length+1}`,
   muscles:"",
   exercises:[],
   selectedExercise:null
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

 const selected = days[dayIndex].selectedExercise;
 if(!selected) return;

 const updated=[...days];

 updated[dayIndex].exercises.push({
  exerciseId:selected.id,
  exerciseName:selected.name,
  order:updated[dayIndex].exercises.length+1,
  reps:"",
  weight:""
 });

 updated[dayIndex].selectedExercise=null;

 setDays(updated);

};

const removeExerciseFromDay=(dayIndex,exIndex)=>{

 const updated=[...days];

 updated[dayIndex].exercises.splice(exIndex,1);

 updated[dayIndex].exercises=
 updated[dayIndex].exercises.map((ex,i)=>({
  ...ex,
  order:i+1
 }));

 setDays(updated);

};

const moveExercise=(dayIndex,exIndex,direction)=>{

 const updated=[...days];
 const exercises=updated[dayIndex].exercises;

 const newIndex=exIndex+direction;

 if(newIndex<0 || newIndex>=exercises.length) return;

 [exercises[exIndex],exercises[newIndex]]=[exercises[newIndex],exercises[exIndex]];

 exercises.forEach((ex,i)=>ex.order=i+1);

 setDays(updated);

};

const updateExerciseField=(dayIndex,exIndex,field,value)=>{

 const updated=[...days];

 updated[dayIndex].exercises[exIndex][field]=value;

 setDays(updated);

};

const handleCreateWorkout = async()=>{

 try{

  const workoutData={
   name:workoutName,
   userId:selectedUser,
   startDate,
   endDate,
   days:days.map(day=>({
    name:day.name,
    muscles:day.muscles,
    exercises:day.exercises
   }))
  };

  const newWorkout = await createWorkout(workoutData);

  await setCurrentWorkout(selectedUser,newWorkout.id);

  resetForm();

  setMessage("Workout creado");

 }catch(e){
  setMessage(e.message);
 }

};

const handleUpdateWorkout = async()=>{

 try{

  const workoutData={
   name:workoutName,
   startDate,
   endDate,
   days:days.map(day=>({
    name:day.name,
    muscles:day.muscles,
    exercises:day.exercises
   }))
  };

  await updateWorkout(workoutId,workoutData);

  resetForm();

  setMessage("Workout actualizado");

 }catch(e){
  setMessage(e.message);
 }

};

return(

<Container maxWidth="md" sx={{mt:4,mb:6}}>

<Paper sx={{p:4}}>

<Typography variant="h4" gutterBottom>
Crear Workout
</Typography>

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
 }

}}
>

<MenuItem value="">Seleccionar usuario</MenuItem>

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
<MenuItem value="last">Último workout</MenuItem>
)}

{templates.map(t=>(
<MenuItem key={t.id} value={`template-${t.id}`}>
{t.name}
</MenuItem>
))}

</TextField>

)}

<TextField
label="Nombre del workout"
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

</Stack>

<Button
variant="contained"
color="success"
onClick={addDay}
>
Agregar día
</Button>

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

<TextField
label="Músculos trabajados"
value={day.muscles}
onChange={(e)=>updateDayField(dayIndex,"muscles",e.target.value)}
/>

<Autocomplete
options={exercises}
getOptionLabel={(option)=>option.name}
value={day.selectedExercise}
onChange={(event,value)=>updateDayField(dayIndex,"selectedExercise",value)}
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

{day.exercises.map((ex,i)=>(

<Card key={i}>

<CardContent>

<Stack direction="row" spacing={2} alignItems="center">

<Typography sx={{width:200}}>
{ex.order}. {ex.exerciseName}
</Typography>

<TextField
type="number"
label="Reps"
size="small"
value={ex.reps}
onChange={(e)=>updateExerciseField(dayIndex,i,"reps",e.target.value)}
/>

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

))}

</Stack>

</AccordionDetails>

</Accordion>

))}

<Stack direction="row" spacing={2}>

{isLastWorkout && (

<Button
variant="contained"
color="success"
onClick={handleUpdateWorkout}
>
Actualizar último workout
</Button>

)}

<Button
variant="contained"
color="success"
onClick={handleCreateWorkout}
>
Crear nuevo workout
</Button>

</Stack>

{message && <Alert severity="info">{message}</Alert>}

</Stack>

</Paper>

</Container>

);
}