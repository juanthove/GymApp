import { useState, useEffect, useRef } from "react";
import useRequireAuth from "../hooks/useRequireAuth";
import useSnackbar from "../hooks/useSnackbar";

import backgroundImg from "../assets/gymproIcon.png";

import { createPhrase, updatePhrase, deletePhrase, getPhrases } from "../services/phraseService";

import { Container, Paper, Typography, TextField, MenuItem, Button, Stack, Box } from "@mui/material";

import BackButton from "../components/BackButton";
import AppSnackbar from "../components/AppSnackbar";
import ConfirmDialog from "../components/ConfirmDialog";

export default function CreatePhraseScreen() {
  useRequireAuth();
  const [phrases, setPhrases] = useState([]);
  const [selectedId, setSelectedId] = useState("new");
  const [currentPhrase, setCurrentPhrase] = useState(null);

  const textInputRef = useRef(null);
  const [text, setText] = useState("");

  const { message, messageType, showMessage, clearMessage } = useSnackbar();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    loadPhrases();
  }, []);

  const loadPhrases = async () => {
    const data = await getPhrases();
    setPhrases(data);
  };

  const resetForm = () => {
    setSelectedId("new");
    setCurrentPhrase(null);
    setText("");
  };

  const handleSelect = (id) => {
    setSelectedId(id);

    if (id === "new") {
      resetForm();
      return;
    }

    const phrase = phrases.find((p) => p.id === Number(id));

    if (!phrase) return;

    setCurrentPhrase(phrase);
    setText(phrase.text);
  };

  const validateForm = () => {
    if (!text.trim()) {
      showMessage("La frase no puede estar vacía", "warning");
      return false;
    }
    return true;
  };

  const savePhrase = async () => {
    if (selectedId === "new") {
      await createPhrase({ text });
      return "Frase creada correctamente";
    }

    await updatePhrase(selectedId, { text });
    return "Frase actualizada correctamente";
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const message = await savePhrase();

      showMessage(message, "success");

      resetForm();
      await loadPhrases();

      requestAnimationFrame(() => {
        textInputRef.current?.focus();
      });
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  const handleDelete = async () => {
    if (!currentPhrase) return;

    try {
      await deletePhrase(currentPhrase.id);

      showMessage("Frase eliminada correctamente", "success");

      resetForm();
      await loadPhrases();
    } catch {
      showMessage("Error al eliminar frase", "error");
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
              Frases
            </Typography>
          </Box>

          <Stack spacing={3}>
            {/* SELECT */}
            <TextField
              select
              label="Seleccionar frase"
              value={selectedId}
              onChange={(e) => handleSelect(e.target.value)}
            >
              <MenuItem value="new">Nueva frase</MenuItem>

              {phrases.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.text}
                </MenuItem>
              ))}
            </TextField>

            {/* INPUT */}
            <TextField
              label="Frase"
              multiline
              minRows={3}
              value={text}
              inputRef={textInputRef}
              onChange={(e) => setText(e.target.value)}
            />

            {/* BOTONES */}
            <Stack direction="row" spacing={2}>
              {currentPhrase && (
                <Button variant="contained" color="error" onClick={() => setConfirmDeleteOpen(true)}>
                  Eliminar
                </Button>
              )}

              <Button variant="contained" color="success" onClick={handleSubmit}>
                {currentPhrase ? "Actualizar" : "Crear"}
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
          title="Eliminar frase"
          message="¿Estás seguro de que deseas eliminar esta frase?"
          confirmText="Eliminar"
          confirmColor="error"
        />

        {/* SNACKBAR */}
        <AppSnackbar message={message} type={messageType} onClose={clearMessage} />
      </Container>
    </Box>
  );
}
