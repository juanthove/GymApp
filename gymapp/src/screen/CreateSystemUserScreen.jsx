import { useState, useEffect } from "react";

import {
  createSystemUser,
  updateSystemUser,
  getSystemUsers,
  deleteSystemUser
} from "../services/systemUserService";

import {
  Container,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Alert,
  Snackbar,
  Box
} from "@mui/material";

import BackButton from "../components/BackButton";

export default function CreateSystemUserScreen() {

  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState("new");
  const [currentUser, setCurrentUser] = useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await getSystemUsers();
    setUsers(data);
  };

  const resetForm = () => {
    setSelectedId("new");
    setCurrentUser(null);
    setUsername("");
    setPassword("");
    setRole("ADMIN");
  };

  const handleSelect = (id) => {
    setSelectedId(id);

    if (id === "new") {
      resetForm();
      return;
    }

    const user = users.find(u => u.id === Number(id));

    setCurrentUser(user);
    setUsername(user.username);
    setPassword(""); // 🔥 nunca cargues password
    setRole(user.role);
  };

  const validateForm = () => {
    if (!username.trim()) {
      setMessage("El usuario es obligatorio");
      setMessageType("warning");
      return false;
    }

    if (!password.trim() && selectedId === "new") {
      setMessage("La contraseña es obligatoria");
      setMessageType("warning");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
        if (selectedId === "new") {

        await createSystemUser({
            username,
            password,
            role
        });

        setMessage("Usuario del sistema creado correctamente");
        setMessageType("success");

        } else {

        await updateSystemUser(selectedId, {
            username,
            password: password || null, // 👈 clave
            role
        });

        setMessage("Usuario actualizado correctamente");
        setMessageType("success");
        }

        resetForm();
        loadUsers();

    } catch (error) {
        setMessage("Error: " + error.message);
        setMessageType("error");
    }
    };

  const handleDelete = async () => {
    if (!currentUser) return;

    if (window.confirm("¿Seguro que deseas eliminar este usuario?")) {
      try {
        await deleteSystemUser(currentUser.id);

        setMessage("Usuario eliminado correctamente");
        setMessageType("success");

        resetForm();
        loadUsers();

      } catch {
        setMessage("Error al eliminar usuario");
        setMessageType("error");
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>

      <Paper sx={{ p: 4 }}>

        {/* 🔙 HEADER */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2
          }}
        >

          {/* 🔙 Flecha a la izquierda */}
          <Box sx={{ position: "absolute", left: 0 }}>
            <BackButton to="/admin" sx={{color: "black"}}/>
          </Box>

          {/* 🧠 Título centrado REAL */}
          <Typography variant="h4" sx={{ transform: "translateY(-2px)" }}>
            Usuarios del sistema
          </Typography>

        </Box>

        <Stack spacing={3}>

          {/* 🔽 SELECT */}
          <TextField
            select
            label="Seleccionar usuario"
            value={selectedId}
            onChange={(e) => handleSelect(e.target.value)}
          >
            <MenuItem value="new">Nuevo Usuario</MenuItem>

            {users.map(u => (
              <MenuItem key={u.id} value={u.id}>
                {u.username} ({u.role})
              </MenuItem>
            ))}
          </TextField>

          {/* 👤 USERNAME */}
          <TextField
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* 🔒 PASSWORD */}
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText={
              currentUser
                ? "Dejar vacío para mantener la contraseña actual"
                : "La contraseña es obligatoria"
            }
          />

          {/* 🎭 ROLE */}
          <TextField
            select
            label="Tipo de usuario"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="STAFF">Común</MenuItem>
          </TextField>

          {/* 🔔 MENSAJES */}
          <Snackbar
            open={!!message}
            autoHideDuration={3000}
            onClose={() => setMessage("")}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert severity={messageType} sx={{ width: "100%" }}>
              {message}
            </Alert>
          </Snackbar>

          {/* 🔘 BOTONES */}
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
              {currentUser ? "Guardar cambios" : "Crear Usuario"}
            </Button>

          </Stack>

        </Stack>
      </Paper>

    </Container>
  );
}