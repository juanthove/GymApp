import { useState, useEffect } from "react";
import { createUser, updateUser, deleteUser, getUsers } from "../services/userService";

import FormPage from "../components/FormPage";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import PrimaryButton from "../components/PrimaryButton";
import DeleteButton from "../components/DeleteButton";

import "../styles/forms.css";

export default function CreateUserScreen() {

  const [users,setUsers] = useState([]);
  const [selectedId,setSelectedId] = useState("new");
  const [currentUser,setCurrentUser] = useState(null);

  const [name,setName] = useState("");
  const [surname,setSurname] = useState("");
  const [gymDays,setGymDays] = useState("");

  const [message,setMessage] = useState("");

  useEffect(()=>{
    loadUsers();
  },[]);

  const loadUsers = async ()=>{
    const data = await getUsers();
    setUsers(data);
  };

  const handleSelect = (id)=>{
    setSelectedId(id);

    if(id==="new"){
      setCurrentUser(null);
      setName("");
      setSurname("");
      setGymDays("");
      return;
    }

    const user = users.find(u=>u.id===Number(id));

    setCurrentUser(user);
    setName(user.name);
    setSurname(user.surname);
    setGymDays(user.gymDaysPerWeek || "");
  };

  const handleSubmit = async (e)=>{
    e.preventDefault();

    try{

      if(selectedId==="new"){

        await createUser({
          name,
          surname,
          gymDaysPerWeek:parseInt(gymDays),
          isLoggedIn:false,
          currentWorkoutId:null
        });

        setMessage("Usuario creado correctamente");

      }else{

        await updateUser(selectedId,{
          name,
          surname,
          gymDaysPerWeek:parseInt(gymDays)
        });

        setMessage("Usuario actualizado correctamente");
      }

      setSelectedId("new");
      setCurrentUser(null);
      setName("");
      setSurname("");
      setGymDays("");

      loadUsers();

    }catch(error){
      setMessage("Error: "+error.message);
    }
  };

  const handleDelete = async ()=>{

    if(!currentUser) return;

    if(window.confirm("¿Seguro que deseas eliminar este usuario?")){

      await deleteUser(currentUser.id);

      setMessage("Usuario eliminado");

      setSelectedId("new");
      setCurrentUser(null);
      setName("");
      setSurname("");
      setGymDays("");

      loadUsers();
    }
  };

  return (

    <FormPage title="Usuarios">

      <form className="form" onSubmit={handleSubmit}>

        <FormSelect
          label="Seleccionar usuario"
          value={selectedId}
          onChange={(e)=>handleSelect(e.target.value)}
        >
          <option value="new">Nuevo Usuario</option>

          {users.map(u=>(
            <option key={u.id} value={u.id}>
              {u.name} {u.surname}
            </option>
          ))}

        </FormSelect>

        <FormInput
          label="Nombre"
          type="text"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          required
        />

        <FormInput
          label="Apellido"
          type="text"
          value={surname}
          onChange={(e)=>setSurname(e.target.value)}
          required
        />

        <FormInput
          label="Días por semana en el gimnasio"
          type="number"
          min="1"
          max="5"
          value={gymDays}
          onChange={(e)=>setGymDays(e.target.value)}
          required
        />

        <div className="buttonContainer">

          {currentUser &&
            <DeleteButton type="button" onClick={handleDelete}>
              Eliminar Usuario
            </DeleteButton>
          }

          <PrimaryButton type="submit">
            {currentUser ? "Actualizar Usuario" : "Crear Usuario"}
          </PrimaryButton>

        </div>

      </form>

      {message && <div className="message">{message}</div>}

    </FormPage>
  );
}
