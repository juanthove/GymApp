import React, { useEffect, useState } from "react";
import { getLoggedUser, getNotLoggedUser, loginUser } from "../services/userService";
import { useNavigate } from "react-router-dom";

import {
Container,
Typography,
Grid,
Card,
CardActionArea,
CardContent,
Dialog,
DialogTitle,
DialogContent,
DialogActions,
Button,
List,
ListItemButton,
ListItemText,
Paper,
Box
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import GymCard from "../components/GymCard";

export default function HomeScreen(){

 const [users,setUsers] = useState([]);
 const [allUsers,setAllUsers] = useState([]);
 const [showModal,setShowModal] = useState(false);
 const [selectedUser,setSelectedUser] = useState(null);

 const navigate = useNavigate();

 useEffect(()=>{
  loadUsers();
 },[]);

 const loadUsers = async()=>{
  try{
   const data = await getLoggedUser();
   setUsers(data);
  }catch(error){
   console.error("Error cargando usuarios:",error);
  }
 };

 const openModal = async()=>{
  try{
   const data = await getNotLoggedUser();
   setAllUsers(data);
   setShowModal(true);
  }catch(error){
   console.error("Error cargando usuarios:",error);
  }
 };

 const goWorkoutWithUser=(user)=>{
  navigate(`/workout/${user.id}`);
 };

 const goWorkout = async()=>{
  try{

   if(!selectedUser) return;

   await loginUser(selectedUser.id);

   navigate(`/workout/${selectedUser.id}`);

  }catch(error){
   console.error("Error logueando usuario:",error);
  }
 };

 return(

  <Container maxWidth="lg" sx={{mt:6,mb:6}}>

    <Typography
      variant="h3"
      sx={{
        mb:5,
        fontWeight:700,
        textAlign:"center"
      }}
      >
      Usuarios activos
    </Typography>

   <Grid container spacing={4} justifyContent="center">

    {users.map(user=>(

     <Grid item xs={12} sm={6} md={4} key={user.id}>

      <GymCard
        title={`${user.name} ${user.surname}`}
        onClick={()=>goWorkoutWithUser(user)}
      />

     </Grid>

    ))}

    {/* BOTÓN + */}

    <Grid item xs={12} sm={6} md={4}>

     <Box
      sx={{
       height:140,
       display:"flex",
       alignItems:"center",
       justifyContent:"center"
      }}
     >

      <Card
       onClick={openModal}
       sx={{
        width:90,
        height:90,
        borderRadius:"50%",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        cursor:"pointer",
        transition:"0.2s",
        "&:hover":{
         transform:"scale(1.08)",
         boxShadow:6
        }
       }}
      >

       <AddIcon sx={{fontSize:42,color:"primary.main"}}/>

      </Card>

     </Box>

    </Grid>

   </Grid>

   {/* MODAL */}

   <Dialog open={showModal} onClose={()=>setShowModal(false)} fullWidth>

    <DialogTitle>
     Seleccionar usuario
    </DialogTitle>

    <DialogContent>

     <Paper variant="outlined">

      <List>

       {allUsers.map(user=>(

        <ListItemButton
         key={user.id}
         selected={selectedUser?.id===user.id}
         onClick={()=>setSelectedUser(user)}
        >

         <ListItemText
          primary={`${user.name} ${user.surname}`}
         />

        </ListItemButton>

       ))}

      </List>

     </Paper>

    </DialogContent>

    <DialogActions>

     <Button onClick={()=>setShowModal(false)}>
      Cancelar
     </Button>

     <Button
      variant="contained"
      disabled={!selectedUser}
      onClick={goWorkout}
     >
      Ingresar
     </Button>

    </DialogActions>

   </Dialog>

  </Container>

 );
}