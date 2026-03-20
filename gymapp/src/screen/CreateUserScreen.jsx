import { useState, useEffect } from "react";

import { createUser, updateUser, deleteUser, getUsers } from "../services/userService";

import {
Container,
Paper,
Typography,
TextField,
MenuItem,
Button,
Stack,
Alert,
Snackbar
} from "@mui/material";

import BackButton from "../components/BackButton";

export default function CreateUserScreen() {

const [users,setUsers] = useState([]);
const [selectedId,setSelectedId] = useState("new");
const [currentUser,setCurrentUser] = useState(null);

const [name,setName] = useState("");
const [surname,setSurname] = useState("");
const [gymDays,setGymDays] = useState("");

const [message,setMessage] = useState("");
const [messageType,setMessageType] = useState("info");

useEffect(()=>{
 loadUsers();
},[]);

const loadUsers = async ()=>{
 const data = await getUsers();
 setUsers(data);
};

const resetForm = ()=>{
 setSelectedId("new");
 setCurrentUser(null);
 setName("");
 setSurname("");
 setGymDays("");
};

const handleSelect = (id)=>{

 setSelectedId(id);

 if(id==="new"){
  resetForm();
  return;
 }

 const user = users.find(u=>u.id===Number(id));

 setCurrentUser(user);
 setName(user.name);
 setSurname(user.surname);
 setGymDays(user.gymDaysPerWeek || "");

};

const validateForm = ()=>{

 if(!name.trim()){
  setMessage("El nombre es obligatorio");
  setMessageType("warning");
  return false;
 }

 if(!surname.trim()){
  setMessage("El apellido es obligatorio");
  setMessageType("warning");
  return false;
 }

 if(!gymDays){
  setMessage("Debes indicar los días de gimnasio por semana");
  setMessageType("warning");
  return false;
 }

 if(gymDays < 1 || gymDays > 7){
  setMessage("Los días de gimnasio deben ser entre 1 y 7");
  setMessageType("warning");
  return false;
 }

 return true;

};

const handleSubmit = async (e)=>{

 e.preventDefault();

 if(!validateForm()) return;

 try{

  if(selectedId==="new"){

   await createUser({
    name,
    surname,
    gymDaysPerWeek:parseInt(gymDays, 10)
   });

   setMessage("Usuario creado correctamente");
   setMessageType("success");

  }else{

   await updateUser(selectedId,{
    name,
    surname,
    gymDaysPerWeek:parseInt(gymDays, 10)
   });

   setMessage("Usuario actualizado correctamente");
   setMessageType("success");

  }

  resetForm();

  loadUsers();

 }catch(error){

  setMessage("Error: "+error.message);
  setMessageType("error");

 }

};

const handleDelete = async ()=>{

 if(!currentUser) return;

 if(window.confirm("¿Seguro que deseas eliminar este usuario?")){

  try{

   await deleteUser(currentUser.id);

   setMessage("Usuario eliminado correctamente");
   setMessageType("success");

   resetForm();

   loadUsers();

  }catch(error){

   setMessage("Error al eliminar usuario");
   setMessageType("error");

  }

 }

};

return(

<Container maxWidth="sm" sx={{mt:4,mb:6}}>

<Paper sx={{p:4}}>

<Stack direction="row" alignItems="center" spacing={1} sx={{mb:2}}>

<BackButton to="/admin" />

<Typography variant="h4" gutterBottom>
Usuarios
</Typography>

</Stack>

<Stack spacing={3}>



<TextField
select
label="Seleccionar usuario"
value={selectedId}
onChange={(e)=>handleSelect(e.target.value)}
>

<MenuItem value="new">Nuevo Usuario</MenuItem>

{users.map(u=>(
<MenuItem key={u.id} value={u.id}>
{u.name} {u.surname}
</MenuItem>
))}

</TextField>

<TextField
label="Nombre"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

<TextField
label="Apellido"
value={surname}
onChange={(e)=>setSurname(e.target.value)}
/>

<TextField
label="Días por semana en el gimnasio"
type="number"
inputProps={{min:1,max:7}}
value={gymDays}
onChange={(e)=>setGymDays(e.target.value)}
/>

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

{currentUser && (

<Button
variant="contained"
color="error"
onClick={handleDelete}
>
Eliminar Usuario
</Button>

)}

<Button
variant="contained"
color="success"
onClick={handleSubmit}
>
{currentUser ? "Actualizar Usuario" : "Crear Usuario"}
</Button>

</Stack>

</Stack>

</Paper>

</Container>

);
}