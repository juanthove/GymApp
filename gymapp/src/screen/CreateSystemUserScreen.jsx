import { useState, useEffect } from "react";
import useRequireAuth from "../hooks/useRequireAuth";
import useSnackbar from "../hooks/useSnackbar";

import backgroundImg from "../assets/gymproIcon.png";

import { createSystemUser, updateSystemUser, getSystemUsers, deleteSystemUser } from "../services/systemUserService";

import { Container, Paper, Typography, TextField, MenuItem, Button, Stack, Box } from "@mui/material";

import BackButton from "../components/BackButton";
import AppSnackbar from "../components/AppSnackbar";
import ConfirmDialog from "../components/ConfirmDialog";

export default function CreateSystemUserScreen() {
  useRequireAuth();
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState("new");
  const [currentUser, setCurrentUser] = useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");

  const { message, messageType, showMessage, clearMessage } = useSnackbar();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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

    const user = users.find((u) => u.id === Number(id));

    if (!user) return;

    setCurrentUser(user);
    setUsername(user.username);
    setPassword("");
    setRole(user.role);
  };

  const validateForm = () => {
    if (!username.trim()) {
      showMessage("El usuario es obligatorio", "warning");
      return false;
    }

    if (!password.trim() && selectedId === "new") {
      showMessage("La contraseña es obligatoria", "warning");
      return false;
    }

    return true;
  };

  const saveUser = async () => {
    if (selectedId === "new") {
      await createSystemUser({
        username,
        password,
        role,
      });

      return "Usuario del sistema creado correctamente";
    }

    await updateSystemUser(selectedId, {
      username,
      password: password || null,
      role,
    });

    return "Usuario actualizado correctamente";
  };

  const handleSubmit = async (e) => {
    if (!validateForm()) return;

    try {
      const message = await saveUser();

      showMessage(message, "success");

      resetForm();
      await loadUsers();
    } catch (error) {
      showMessage("Error: " + error.message, "error");
    }
  };

  const handleDelete = async () => {
    if (!currentUser) return;

    try {
      await deleteSystemUser(currentUser.id);

      showMessage("Usuario eliminado correctamente", "success");

      resetForm();
      await loadUsers();
    } catch {
      showMessage("Error al eliminar usuario", "error");
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* BACKGROUND */}

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${backgroundImg})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",

          "@media (min-aspect-ratio: 16/9)": {
            backgroundSize: "90%",
          },

          zIndex: 0,
        }}
      />

      {/* OVERLAY */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(44, 44, 44, 0.4)",
          backdropFilter: "blur(6px)",
          zIndex: 1,
        }}
      />
      <Container maxWidth="sm" sx={{ mt: 4, mb: 6, position: "relative", zIndex: 2 }}>
        <Paper sx={{ p: 4 }}>
          {/* HEADER */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            {/* Flecha a la izquierda */}
            <Box sx={{ position: "absolute", left: 0 }}>
              <BackButton to="/admin" sx={{ color: "black" }} />
            </Box>

            {/* Título centrado */}
            <Typography variant="h4" sx={{ transform: "translateY(-2px)" }}>
              Usuarios del sistema
            </Typography>
          </Box>

          <Stack spacing={3}>
            {/* SELECT */}
            <TextField
              select
              label="Seleccionar usuario"
              value={selectedId}
              onChange={(e) => handleSelect(e.target.value)}
            >
              <MenuItem value="new">Nuevo Usuario</MenuItem>

              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.username} ({u.role})
                </MenuItem>
              ))}
            </TextField>

            {/* USERNAME */}
            <TextField label="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} />

            {/* PASSWORD */}
            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText={
                currentUser ? "Dejar vacío para mantener la contraseña actual" : "La contraseña es obligatoria"
              }
            />

            {/* ROL */}
            <TextField select label="Tipo de usuario" value={role} onChange={(e) => setRole(e.target.value)}>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="STAFF">Común</MenuItem>
            </TextField>

            {/* BOTONES */}
            <Stack direction="row" spacing={2}>
              {currentUser && (
                <Button variant="contained" color="error" onClick={() => setConfirmDeleteOpen(true)}>
                  Eliminar Usuario
                </Button>
              )}

              <Button variant="contained" color="success" onClick={handleSubmit}>
                {currentUser ? "Guardar cambios" : "Crear Usuario"}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
        <ConfirmDialog
          open={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          onConfirm={async () => {
            await handleDelete();
            setConfirmDeleteOpen(false);
          }}
          title="Eliminar usuario"
          message="¿Estás seguro de que deseas eliminar este usuario?"
          confirmText="Eliminar"
          confirmColor="error"
        />

        {/* MENSAJES */}
        <AppSnackbar message={message} type={messageType} onClose={clearMessage} />
      </Container>
    </Box>
  );
}
