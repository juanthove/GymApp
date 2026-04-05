import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import backgroundImg from "../assets/gymproIcon.png";

import { getUserById, getCurrentWorkout, logoutUser } from "../services/userService";
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
import PrimaryButton from "../components/PrimaryButton";

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

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-UY");
};

const hasDayInProgress = () => {
  return Object.values(dayStatus).some(status => status === "IN_PROGRESS");
};

const handleLogout = () => {

  if (hasDayInProgress()) {
    alert("No podés cerrar sesión mientras hay un entrenamiento en curso");
    return;
  }

  logoutUser(userId);

  navigate("/home");
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


if (!user) {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#2c2c2c", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <Typography color="white">Cargando...</Typography>
    </Box>
  );
}

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
      zIndex: 0
    }}
  />

  {/* 🌑 OVERLAY */}
  <Box
    sx={{
      position: "absolute",
      inset: 0,
      backgroundColor: "rgba(44, 44, 44, 0.4)",
      backdropFilter: "blur(6px)",
      zIndex: 1
    }}
  />

  {/* 📦 CONTENIDO */}
  <Container
    maxWidth="sm"
    sx={{
      position: "relative",
      zIndex: 2, // 👈 CLAVE
      mt: 6
    }}
  >

<Stack spacing={4}>

<Box sx={{ position: "relative", mb: 2 }}>

  {/* 🔝 TOP BAR */}
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}
  >
    <BackButton to="/home" />

    <PrimaryButton
      label="Cerrar sesión"
      onClick={handleLogout}
      disabled={hasDayInProgress()}
      sx={{
        fontSize: "0.75rem",
        px: 2,
        py: 0.8,
        background: "linear-gradient(145deg, #ff5a5a, #d32f2f)"
      }}
    />
  </Box>

  {/* 👋 TITULO */}
  <Typography
    variant="h3"
    textAlign="center"
    sx={{
      mt: 2,
      fontWeight: 800
    }}
  >
    Hola {user.name}
  </Typography>

</Box>

{workout && (
  <Typography variant="h6" textAlign="center" color="white">
    Desde {formatDate(workout.startDate)} hasta {formatDate(workout.endDate)}
  </Typography>
)}

<Typography variant="h5" textAlign="center" sx={{fontStyle:"italic", color:"white"}}>
{phrase}
</Typography>

{!hasWorkout &&
 <Typography textAlign="center" color="white">
  Este usuario no tiene planilla asignada actualmente.
 </Typography>
}

{workout && sortedDays.map(day => {

 const status = dayStatus[day.id];

 return(

<GymCard
  key={day.id}
  title={day.name}
  subtitle={<MuscleChips muscles={day.muscles} chipSx={{ fontWeight: 600, fontSize: "1.05rem" }} />}
  onClick={() => openDay(day)}
  status={status}
  showArrow={true}
/>

);

})}


<PrimaryButton
            label="📊 Estadísticas"
            to={`/stats/${userId}`}
          />

<PrimaryButton
            label="🏆 Logros"
            to={``}
          />

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

<MuscleChips muscles={selectedDay?.muscles} chipSx={{fontWeight: 600,}} />

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

</Box>

);

}