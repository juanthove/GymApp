import React, { useState, useEffect } from "react";
import { createUser, updateUser, deleteUser, getUsers } from "../services/userService";

export default function CreateUserScreen() {

  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState("new");
  const [currentUser, setCurrentUser] = useState(null);

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [gymDays, setGymDays] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  const handleSelect = (id) => {
    setSelectedId(id);

    if (id === "new") {
      setCurrentUser(null);
      setName("");
      setSurname("");
      setGymDays("");
      return;
    }

    const user = users.find(u => u.id === Number(id));
    setCurrentUser(user);
    setName(user.name);
    setSurname(user.surname);
    setGymDays(user.gymDaysPerWeek || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (selectedId === "new") {
        await createUser({
          name,
          surname,
          gymDaysPerWeek: parseInt(gymDays),
          isLoggedIn: false,
          currentWorkoutId: null
        });
        setMessage("Usuario creado correctamente");
      } else {
        await updateUser(selectedId, {
          name,
          surname,
          gymDaysPerWeek: parseInt(gymDays)
        });
        setMessage("Usuario actualizado correctamente");
      }

      // Reset formulario a nuevo usuario
      setSelectedId("new");
      setCurrentUser(null);
      setName("");
      setSurname("");
      setGymDays("");

      loadUsers();

    } catch (error) {
      console.error(error);
      setMessage("Error: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (!currentUser) return;

    if (window.confirm("¿Seguro que deseas eliminar este usuario?")) {
      try {
        await deleteUser(currentUser.id);
        setMessage("Usuario eliminado");
        setSelectedId("new");
        setCurrentUser(null);
        setName("");
        setSurname("");
        setGymDays("");
        loadUsers();
      } catch (error) {
        console.error(error);
        setMessage("Error eliminando usuario: " + error.message);
      }
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Usuarios</h1>

      <form style={styles.form} onSubmit={handleSubmit}>

        <label style={styles.label}>Seleccionar usuario</label>
        <select
          style={styles.select}
          value={selectedId}
          onChange={(e) => handleSelect(e.target.value)}
        >
          <option value="new">Nuevo Usuario</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} {u.surname}
            </option>
          ))}
        </select>

        <label style={styles.label}>Nombre</label>
        <input
          style={styles.input}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label style={styles.label}>Apellido</label>
        <input
          style={styles.input}
          type="text"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          required
        />

        <label style={styles.label}>Días por semana en el gimnasio</label>
        <input
          style={styles.input}
          type="number"
          min="1"
          max="5"
          value={gymDays}
          onChange={(e) => setGymDays(e.target.value)}
          required
        />

        <div style={styles.buttonContainer}>
          {currentUser && (
            <button type="button" style={{...styles.button, ...styles.deleteButton}} onClick={handleDelete}>
              Eliminar Usuario
            </button>
          )}
          <button type="submit" style={styles.button}>
            {currentUser ? "Actualizar Usuario" : "Crear Usuario"}
          </button>
        </div>
      </form>

      {message && <div style={styles.message}>{message}</div>}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0B0F1A",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  title: {
    color: "#FF6B00",
    marginBottom: "30px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "400px",
    gap: "12px",
    backgroundColor: "#1C1F2A",
    padding: "25px",
    borderRadius: "15px"
  },
  label: {
    color: "white",
    fontSize: "14px"
  },
  select: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2A2E3B",
    color: "white"
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "none"
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px"
  },
  button: {
    backgroundColor: "#FF6B00",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    flex: 1,
    marginLeft: "5px"
  },
  deleteButton: {
    backgroundColor: "#FF0000",
    marginRight: "5px"
  },
  message: {
    marginTop: "20px",
    color: "white"
  }
};