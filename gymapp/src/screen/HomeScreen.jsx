import React, { useEffect, useState } from "react";
import { getLoggedUser, getNotLoggedUser, loginUser, getUserImageUrl } from "../services/userService";
import { useNavigate } from "react-router-dom";

import backgroundImg from "../assets/gymproIcon.png";

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
ListItemAvatar,
ListItemText,
Avatar,
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

  <Box
    sx={{
      minHeight: "100vh",
      width: "100%",
      overflowX: "hidden",
      position: "relative",
      backgroundImage: `url(${backgroundImg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      pt: 6 
    }}
  >

    {/* OVERLAY (para transparencia) */}
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(88, 88, 88, 0.6)" 
      }}
    />

    {/* CONTENIDO */}
    <Box sx={{ position: "relative", zIndex: 1 }}>


  <Container maxWidth="lg" sx={{pb:6}}>

    <Box sx={{ textAlign: "center" }}>
      <Typography
        variant="h3"
        sx={{
          mb: 5,
          fontWeight: 700,
          display: "inline-block",
          lineHeight: 0.55
        }}
      >
        Usuarios activos

        <Box sx={{ width: "150%", ml: "-25%"}}>
          <svg
            width="100%"
            height="6"
            viewBox="0 0 100 6"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id="blur">
                <feGaussianBlur stdDeviation="0.4" />
              </filter>
            </defs>
            <linearGradient id="grad" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#e53935" stopOpacity="0" />
              <stop offset="10%" stopColor="#e53935" stopOpacity="1" />
              <stop offset="90%" stopColor="#e53935" stopOpacity="1" />
              <stop offset="100%" stopColor="#e53935" stopOpacity="0" />
            </linearGradient>
            <path
              d="M0 3 Q 50 6 100 3 Q 50 0 0 3"
              fill="url(#grad)"
              filter="url(#blur)"
            />
          </svg>
        </Box>
      </Typography>
    </Box>

   <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)", // 🔥 SIEMPRE 3
        gap: 4,
        maxWidth: "1100px",
        margin: "0 auto",
        px: 3,
        boxSizing: "border-box",
        width: "100%"
      }}
    >

    {users.map(user=>(

      <GymCard
        key={user.id}
        title={`${user.name} ${user.surname}`}
        imageUrl={user.image ? getUserImageUrl(user.image) : null}
        onClick={()=>goWorkoutWithUser(user)}
        variant="user"
        sx={{ width: "100%"}}
      />

    ))}

    {/* BOTÓN + */}

     <Box
      sx={{
       height:140,
       display:"flex",
       alignItems:"center",
       justifyContent:"center",
       width: "100%",
       height: "100%"
      }}
     >

      <Card
       onClick={openModal}
       sx={{
        width:180,
        height:180,
        borderRadius:"50%",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        cursor:"pointer",
        transition:"0.2s",
        border: "2px solid #d32f2f",
        "&:hover":{
         transform:"scale(1.1)",
         boxShadow:6
        }
       }}
      >

       <AddIcon sx={{fontSize:70,color:"mainRed.hover"}}/>

      </Card>

     </Box>

   </Box>

   {/* MODAL */}

   <Dialog
    open={showModal}
    onClose={() => setShowModal(false)}
    fullWidth
    maxWidth="xs"
    PaperProps={{
      sx: {
        borderRadius: 4,
        p: 1
      }
    }}
  >
    <DialogTitle
      sx={{
        fontWeight: 700,
        textAlign: "center",
        pb: 1
      }}
    >
      Seleccionar usuario
    </DialogTitle>

    <DialogContent>
      <List sx={{ mt: 1 }}>

        {allUsers.map(user => (
          <ListItemButton
            key={user.id}
            selected={selectedUser?.id === user.id}
            onClick={() => setSelectedUser(user)}
            sx={{
              borderRadius: 3,
              mb: 1,
              transition: "0.2s",

              "&.Mui-selected": {
                backgroundColor: "mainRed.main",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "mainRed.hover"
                }
              }
            }}
          >
            <ListItemAvatar>
              <Avatar src={user.image ? getUserImageUrl(user.image) : undefined}>
                {user.name?.[0]}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`${user.name} ${user.surname}`}
              primaryTypographyProps={{
                fontWeight: selectedUser?.id === user.id ? 600 : 400
              }}
            />
          </ListItemButton>
        ))}

      </List>
    </DialogContent>

    <DialogActions
      sx={{
        justifyContent: "space-between",
        px: 3,
        pb: 2
      }}
    >
      <Button
        onClick={() => setShowModal(false)}
        variant="outlined"
        sx={{
          borderRadius: 5,
          px: 3,
          textTransform: "none",
          fontWeight: 500
        }}
      >
        Cancelar
      </Button>

      <Button
        variant="contained"
        disabled={!selectedUser}
        onClick={goWorkout}
        sx={{
          borderRadius: 5,
          px: 4,
          textTransform: "none",
          fontWeight: 600,
          backgroundColor: "#202020",
          "&:hover": {
            backgroundColor: "#000000"
          }
        }}
      >
        Ingresar
      </Button>
    </DialogActions>
  </Dialog>

  </Container>

  </Box>

  </Box>

 );
}