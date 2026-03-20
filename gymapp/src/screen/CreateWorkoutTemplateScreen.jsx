import { useState, useEffect } from "react";

import { getExercises } from "../services/exerciseService";

import {
  getWorkoutTemplates,
  getWorkoutTemplateById,
  createWorkoutTemplate,
  updateWorkoutTemplate,
  deleteWorkoutTemplate,
  getDaysByTemplate,
  createDay,
  updateDay,
  deleteDay,
  reorderDays,
  uploadWorkoutTemplateDayImage,
  deleteWorkoutTemplateDayImage,
  getWorkoutTemplateDayImageUrl,
  addExerciseToDay,
  removeExerciseFromDay,
  reorderExercises
} from "../services/workoutTemplateService";

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
Autocomplete
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FileCopyIcon from "@mui/icons-material/FileCopy";

import BackButton from "../components/BackButton";

export default function CreateWorkoutTemplateScreen(){

const [templates,setTemplates] = useState([]);
const [exercises,setExercises] = useState([]);

const [selectedTemplateId,setSelectedTemplateId] = useState("");

const [name,setName] = useState("");
const [description,setDescription] = useState("");
const [days,setDays] = useState([]);

const [message,setMessage] = useState("");
const [messageType,setMessageType] = useState("info");

useEffect(()=>{
 loadTemplates();
 loadExercises();
},[]);

const loadTemplates = async()=>{
 const data = await getWorkoutTemplates();
 setTemplates(data);
};

const loadExercises = async()=>{
 const data = await getExercises();
 setExercises(data);
};

const resetForm = ()=>{
 setSelectedTemplateId("");
 setName("");
 setDescription("");
 setDays([]);
};

const validateTemplate = ()=>{

 if(!name.trim()){
  setMessage("La plantilla debe tener nombre");
  setMessageType("warning");
  return false;
 }

 if(days.length===0){
  setMessage("Debes agregar al menos un día");
  setMessageType("warning");
  return false;
 }

 for(let d=0; d<days.length; d++){

  const day=days[d];

  if(!day.name.trim()){
   setMessage(`El día ${d+1} debe tener nombre`);
   setMessageType("warning");
   return false;
  }

  if(!day.muscles.trim()){
   setMessage(`El día ${d+1} debe tener músculos trabajados`);
   setMessageType("warning");
   return false;
  }

  if(day.exercises.length===0){
   setMessage(`El día ${d+1} debe tener al menos un ejercicio`);
   setMessageType("warning");
   return false;
  }

 }

 setMessage("");
 return true;

};

const loadTemplateData = async(id)=>{

 if(!id){
  resetForm();
  return;
 }

 const template = await getWorkoutTemplateById(id);

 setName(template.name || "");
 setDescription(template.description || "");

 const loadedDays = template.days.map(day=>({

  id: day.id, // 🔥 importante para saber si ya existe

  name:day.name,
  muscles:day.muscles,
  dayOrder: day.dayOrder,

  exercises:day.exercises.map(ex=>({
   exerciseId:ex.exerciseId,
   exerciseName:ex.exerciseName,
   order:ex.order
  })),

  selectedExercise:null,

  image:null,
  deleteImage:false,

  // 🔥 usamos helper del front
  preview: day.muscleImage 
    ? getWorkoutTemplateDayImageUrl(day.muscleImage) 
    : null

 }));

 setDays(loadedDays);

};

const addDay=()=>{

 setDays([
  ...days,
  {
   id: null,
   name:`Día ${days.length+1}`,
   muscles:"",
   exercises:[],
   selectedExercise:null,
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

 const selected = days[dayIndex].selectedExercise;
 if(!selected) return;

 const updated=[...days];

 updated[dayIndex].exercises.push({
  exerciseId:selected.id,
  exerciseName:selected.name,
  order:updated[dayIndex].exercises.length+1
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

const duplicateDay = (index) => {

 const dayToCopy = days[index];

 const newDay = {
  id: null, // 🔥 nuevo día
  name: dayToCopy.name + " copia",
  muscles: dayToCopy.muscles,
  exercises: dayToCopy.exercises.map(ex => ({ ...ex })),
  selectedExercise: null,
  image: null,
  deleteImage: false,
  preview: null // 🔥 NO copiar imagen
 };

 const updated = [...days];
 updated.splice(index + 1, 0, newDay);

 setDays(updated);

};

const handleSubmit = async()=>{

 if(!validateTemplate()) return;

 try{

  const templateData={
   name,
   description,
   days:days.map((day,index)=>({
    name:day.name,
    muscles:day.muscles,
    dayOrder: index + 1,
    exercises:day.exercises
  }))
  };

  let templateId;

  // 1️⃣ GUARDAR TEMPLATE
  if(selectedTemplateId){

   await updateWorkoutTemplate(selectedTemplateId,templateData);
   templateId = selectedTemplateId;

   setMessage("Template actualizado correctamente");
   setMessageType("success");

  }else{

   const res = await createWorkoutTemplate(templateData);
   templateId = res.id;

   setMessage("Template creado correctamente");
   setMessageType("success");
  }

  // 2️⃣ TRAER TEMPLATE CON IDS NUEVOS
  const fullTemplate = await getWorkoutTemplateById(templateId);

  // 3️⃣ IMÁGENES (solo si usuario hizo algo)
  for (let i = 0; i < fullTemplate.days.length; i++) {

    const backendDay = fullTemplate.days[i];
    const frontDay = days[i];

    if (frontDay.image) {
      await uploadWorkoutTemplateDayImage(backendDay.id, frontDay.image);
    }

    else if (frontDay.deleteImage) {
      await deleteWorkoutTemplateDayImage(backendDay.id);
    }
  }

  // 4️⃣ RESET
  resetForm();
  loadTemplates();

 }catch(e){

  setMessage(e.message);
  setMessageType("error");

 }

};

const handleDelete = async()=>{

 if(!selectedTemplateId) return;

 if(!window.confirm("Eliminar este template?")) return;

 try{

  await deleteWorkoutTemplate(selectedTemplateId);

  setMessage("Template eliminado");
  setMessageType("success");

  resetForm();
  loadTemplates();

 }catch(e){

  setMessage(e.message);
  setMessageType("error");

 }

};

return(

<Container maxWidth="md" sx={{mt:4,mb:6}}>

<Paper sx={{p:4}}>



<Stack direction="row" alignItems="center" spacing={1} sx={{mb:2}}>
        
<BackButton to="/admin" />
          
<Typography variant="h4" gutterBottom>
Plantillas
</Typography>
        
</Stack>

<Stack spacing={3}>

<TextField
select
label="Seleccionar plantilla"
value={selectedTemplateId}
onChange={(e)=>{
 const id=e.target.value;
 setSelectedTemplateId(id);
 loadTemplateData(id);
}}
>

<MenuItem value="">
Nueva plantilla
</MenuItem>

{templates.map(t=>(
<MenuItem key={t.id} value={t.id}>
{t.name}
</MenuItem>
))}

</TextField>

<TextField
label="Nombre de la plantilla"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

<TextField
label="Descripción"
multiline
minRows={3}
value={description}
onChange={(e)=>setDescription(e.target.value)}
/>


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

<TextField
label="Músculos trabajados"
value={day.muscles}
onChange={(e)=>updateDayField(dayIndex,"muscles",e.target.value)}
/>

<Typography variant="subtitle1">
Imagen del día
</Typography>

<input
  type="file"
  accept="image/*"
  onChange={(e)=>{
    const file = e.target.files[0];
    if(!file) return;

    const updated=[...days];

    updated[dayIndex].image = file;
    updated[dayIndex].preview = URL.createObjectURL(file);
    updated[dayIndex].deleteImage = false;

    setDays(updated);
  }}
/>

{day.preview && (
  <Stack spacing={1}>

    <FormControlLabel
      control={
        <Checkbox
          checked={day.deleteImage}
          onChange={()=>{
            const updated=[...days];

            updated[dayIndex].deleteImage = !updated[dayIndex].deleteImage;

            if(updated[dayIndex].deleteImage){
              updated[dayIndex].image = null;
            }

            setDays(updated);
          }}
        />
      }
      label="Eliminar imagen"
    />

    {!day.deleteImage && (
      <img
        src={day.preview}
        style={{
          maxWidth:"300px",
          borderRadius:"8px"
        }}
      />
    )}

  </Stack>
)}

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

<Typography sx={{width:220}}>
{ex.order}. {ex.exerciseName}
</Typography>

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

<Button
variant="contained"
color="success"
onClick={addDay}
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

{selectedTemplateId && (

<Button
variant="contained"
color="error"
onClick={handleDelete}
>
Eliminar Plantilla
</Button>

)}

<Button
variant="contained"
color="success"
onClick={handleSubmit}
>
{selectedTemplateId ? "Actualizar Plantilla" : "Guardar Plantilla"}
</Button>

</Stack>

</Stack>

</Paper>

</Container>

);
}