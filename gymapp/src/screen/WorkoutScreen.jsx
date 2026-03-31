import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getUserById, getCurrentWorkout } from "../services/userService";
import { getWorkoutById } from "../services/workoutService";
import { startWorkoutDay, getWorkoutDayStatus, getWorkoutDayImageUrl } from "../services/workoutDayService";
import { getRandomPhrase } from "../services/phraseService";

import {
Container,
Typography,
Stack,
Box,
Button,
Dialog,
DialogTitle,
DialogContent,
DialogActions
} from "@mui/material";

import GymCard from "../components/GymCard";
import BackButton from "../components/BackButton";
import MuscleChips from "../components/MuscleChips";

export default function WorkoutScreen(){

const { userId } = useParams();
const navigate = useNavigate();

const [user,setUser] = useState(null);
const [workout,setWorkout] = useState(null);
const [selectedDay,setSelectedDay] = useState(null);
const [phrase,setPhrase] = useState("");
const [dayStatus,setDayStatus] = useState({});
const [hasWorkout,setHasWorkout] = useState(true);

useEffect(()=>{
 loadData();
},[]);

const loadData = async()=>{

 const u = await getUserById(userId);
 setUser(u);

 let current = null;

 try{
  current = await getCurrentWorkout(userId);
  setHasWorkout(!!current);
 }catch{
  setHasWorkout(false);
 }

 if(current){

  const w = await getWorkoutById(current.id);

  const statuses = {};

  for(const day of w.days){
   const status = await getWorkoutDayStatus(day.id);
   statuses[day.id] = status;
  }

  setDayStatus(statuses);
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

const startWorkout= async ()=>{

 const status = dayStatus[selectedDay.id];

 if(status === "NOT_STARTED"){
  await startWorkoutDay(selectedDay.id);
 }

 navigate(`/exercise/${userId}/${selectedDay.id}`);

};

const sortedDays = workout?.days
 ? [...workout.days].sort((a,b)=>{

  const order = {
   IN_PROGRESS:0,
   NOT_STARTED:1,
   COMPLETED:2
  };

  const statusA = dayStatus[a.id] || "NOT_STARTED";
  const statusB = dayStatus[b.id] || "NOT_STARTED";

  if(order[statusA] !== order[statusB]){
   return order[statusA] - order[statusB];
  }

  return a.dayOrder - b.dayOrder;

 })
 : [];


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

{!hasWorkout &&
 <Typography textAlign="center" color="text.secondary">
  Este usuario no tiene planilla asignada actualmente.
 </Typography>
}

{workout && sortedDays.map(day => {

 const status = dayStatus[day.id];

 return(

<GymCard
 key={day.id}
 title={day.name}
 subtitle={
    <Box my={1}>
        <MuscleChips muscles={day.muscles} />
    </Box>
 }
 onClick={()=>openDay(day)}
 sx={{
  opacity: status === "COMPLETED" ? 0.6 : 1
 }}
>

{status === "COMPLETED" &&

<Typography color="success.main" fontWeight={700}>
 ✔ Completado
</Typography>

}

{status === "IN_PROGRESS" &&

<Typography color="warning.main" fontWeight={700}>
 ⏳ En curso
</Typography>

}

</GymCard>

);

})}

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


<DialogTitle sx={{textAlign:"center"}}>
Músculos que vas a trabajar hoy
</DialogTitle>


<DialogContent>

<Box display="flex"
    flexDirection="column"
    alignItems="center"
    textAlign="center"
    gap={2}
>

<MuscleChips muscles={selectedDay?.muscles} />

<img
 src={selectedDay?.muscleImage ? getWorkoutDayImageUrl(selectedDay.muscleImage) : "/body-placeholder.png"}
 style={{width:"100%", maxWidth:"500px"}}
/>

</Box>

</DialogContent>


<DialogActions>

<Button onClick={()=>setSelectedDay(null)}>
Cancelar
</Button>

<Button
 variant="contained"
 onClick={startWorkout}
 disabled={dayStatus[selectedDay?.id] === "COMPLETED"}
>

{dayStatus[selectedDay?.id] === "NOT_STARTED" && "Comenzar entrenamiento"}

{dayStatus[selectedDay?.id] === "IN_PROGRESS" && "Continuar entrenamiento"}

{dayStatus[selectedDay?.id] === "COMPLETED" && "Entrenamiento completado"}

</Button>

</DialogActions>

</Dialog>

</Container>

);

}