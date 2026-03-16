import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getUserById, getCurrentWorkout } from "../services/userService";
import { getWorkoutById } from "../services/workoutService";
import { getRandomPhrase } from "../services/phraseService";

import GymCard from "../components/GymCard";

import {
Container,
Typography,
Stack,
Button,
Dialog,
DialogTitle,
DialogContent,
DialogActions
} from "@mui/material";

import BackButton from "../components/BackButton";

export default function WorkoutScreen(){

const { userId } = useParams();
const navigate = useNavigate();

const [user,setUser] = useState(null);
const [workout,setWorkout] = useState(null);
const [selectedDay,setSelectedDay] = useState(null);
const [phrase,setPhrase] = useState("");

useEffect(()=>{
 loadData();
},[]);

const loadData = async()=>{

 const u = await getUserById(userId);
 setUser(u);

 const current = await getCurrentWorkout(userId);

 if(current){
  const w = await getWorkoutById(current.id);
  setWorkout(w);
 }

 try{
  const phraseData = await getRandomPhrase();
  setPhrase(phraseData.text);
 }catch{
  setPhrase("Hoy es un buen día para mejorar.");
 }

};

const openDay=(day)=>{
 setSelectedDay(day);
};

const startWorkout=()=>{
 navigate(`/exercise/${userId}/${selectedDay.id}`);
};

if(!user) return null;

return(

<Container maxWidth="sm" sx={{mt:6}}>

<Stack spacing={4}>

<Stack direction="row" alignItems="center" spacing={1} sx={{position:"relative"}}>
 <BackButton to="/home" sx={{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)" }} />
 <Typography variant="h4" textAlign="center" sx={{width:"100%"}}>
  Hola {user.name}
 </Typography>
</Stack>

<Typography textAlign="center" sx={{fontStyle:"italic"}}>
{phrase}
</Typography>

{workout && workout.days.map(day => (

<GymCard
 key={day.order}
 title={day.name}
 subtitle={day.muscles}
 onClick={()=>openDay(day)}
 sx={{
  opacity: day.completed ? 0.6 : 1
 }}
>

{day.completed &&

<Typography color="success.main" fontWeight={700}>
 ✔ Completado
</Typography>

}

</GymCard>

))}

<Button variant="contained">
📊 Estadísticas
</Button>

<Button variant="contained">
🏆 Logros
</Button>

</Stack>


<Dialog
 open={!!selectedDay}
 onClose={()=>setSelectedDay(null)}
 fullWidth
>

<DialogTitle>
Músculos que vas a trabajar hoy
</DialogTitle>

<DialogContent>

<Typography sx={{mb:2}}>
{selectedDay?.muscles}
</Typography>

<img
 src="/body-placeholder.png"
 style={{width:"100%"}}
/>

</DialogContent>

<DialogActions>

<Button onClick={()=>setSelectedDay(null)}>
Cancelar
</Button>

<Button
 variant="contained"
 onClick={startWorkout}
 disabled={selectedDay?.completed}
>
{selectedDay?.completed
 ? "Entrenamiento completado"
 : "Comenzar entrenamiento"}
</Button>

</DialogActions>

</Dialog>

</Container>

);

}