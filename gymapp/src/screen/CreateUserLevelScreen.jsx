import { useEffect, useState } from "react";
import {
  getUserLevels,
  updateUserLevelsOrder,
  createUserLevel,
  deleteUserLevel
} from "../services/userLevelService";

import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  IconButton,
  Box
} from "@mui/material";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";

import BackButton from "../components/BackButton";
import AppSnackbar from "../components/AppSnackbar";
import SortableList from "../components/sortable/SortableList";
import SortableItem from "../components/sortable/SortableItem";

export default function CreateUserLevel() {

  const [levels, setLevels] = useState([]);
  const [newName, setNewName] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    const data = await getUserLevels();
    setLevels(data.sort((a, b) => a.levelOrder - b.levelOrder));
  };

  const moveLevel = (index, direction) => {
    const updated = [...levels];
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= updated.length) return;

    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    setLevels(updated);
  };

  const handleSaveOrder = async () => {
    try {
      const payload = levels.map((lvl, index) => ({
        id: lvl.id,
        levelOrder: index + 1
      }));

      await updateUserLevelsOrder(payload);

      setMessage("Orden guardado correctamente");
      setMessageType("success");

      loadLevels();

    } catch (e) {
      setMessage("Error al guardar el orden");
      setMessageType("error");
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;

    try {
      await createUserLevel({ name: newName });

      setMessage("Nivel creado correctamente");
      setMessageType("success");

      setNewName("");
      loadLevels();

    } catch (e) {
      setMessage("Error al crear el nivel");
      setMessageType("error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUserLevel(id);

      setMessage("Nivel eliminado");
      setMessageType("success");

      loadLevels();

    } catch (e) {
      setMessage("Error al eliminar");
      setMessageType("error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>

        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3
          }}
        >

          {/* 🔙 Flecha */}
          <Box sx={{ position: "absolute", left: 0 }}>
            <BackButton to="/admin" sx={{ color: "black" }} />
          </Box>

          {/* 🧠 Título centrado */}
          <Typography variant="h4">
            Niveles de Usuario
          </Typography>

        </Box>

        <Stack spacing={2}>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Nuevo nivel"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button variant="contained" onClick={handleAdd}>
              Agregar
            </Button>
          </Stack>

          {/* DRAG & DROP */}
          <SortableList
            items={levels}
            setItems={setLevels}
            getId={(lvl) => lvl.id}
          >
            <Stack spacing={2}>
              {levels.map((lvl, index) => (
                <SortableItem key={lvl.id} id={lvl.id}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography sx={{ width: 40 }}>
                            {index + 1}
                          </Typography>

                          <Typography sx={{ flexGrow: 1 }}>
                            {lvl.name}
                          </Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={5} sx={{ mr: 3 }}>
                          <IconButton onClick={() => handleDelete(lvl.id)} sx={{ mr: 6 }}>
                            <DeleteIcon color="error" />
                          </IconButton>

                          {/* 👇 HANDLE */}
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "repeat(2, 8px)",
                              gap: "5px",
                              cursor: "grab",
                              mr: 3
                            }}
                          >
                            {[...Array(6)].map((_, i) => (
                              <Box
                                key={i}
                                sx={{
                                  width: 7,
                                  height: 7,
                                  backgroundColor: "#888",
                                  borderRadius: "50%"
                                }}
                              />
                            ))}
                          </Box>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </SortableItem>
              ))}
            </Stack>
          </SortableList>

          <Button
            variant="contained"
            color="success"
            onClick={handleSaveOrder}
          >
            Guardar orden
          </Button>

        </Stack>
        <AppSnackbar
          message={message}
          type={messageType}
          onClose={() => setMessage("")}
        />
      </Paper>
    </Container>
  );
}