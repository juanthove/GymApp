import { useState, useEffect } from "react";

import {
  createPhrase,
  updatePhrase,
  deletePhrase,
  getPhrases
} from "../services/phraseService";

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

export default function CreatePhraseScreen() {

  const [phrases, setPhrases] = useState([]);
  const [selectedId, setSelectedId] = useState("new");
  const [currentPhrase, setCurrentPhrase] = useState(null);

  const [text, setText] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

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

    const phrase = phrases.find(p => p.id === Number(id));

    setCurrentPhrase(phrase);
    setText(phrase.text);
  };

  const validateForm = () => {
    if (!text.trim()) {
      setMessage("La frase no puede estar vacía");
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

        await createPhrase({ text });

        setMessage("Frase creada correctamente");
        setMessageType("success");

      } else {

        await updatePhrase(selectedId, { text });

        setMessage("Frase actualizada correctamente");
        setMessageType("success");
      }

      resetForm();
      loadPhrases();

    } catch (error) {
      setMessage("Error: " + error.message);
      setMessageType("error");
    }
  };

  const handleDelete = async () => {
    if (!currentPhrase) return;

    if (window.confirm("¿Seguro que deseas eliminar esta frase?")) {
      try {

        await deletePhrase(currentPhrase.id);

        setMessage("Frase eliminada correctamente");
        setMessageType("success");

        resetForm();
        loadPhrases();

      } catch {
        setMessage("Error al eliminar frase");
        setMessageType("error");
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>

      <Paper sx={{ p: 4 }}>

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

            {phrases.map(p => (
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
            onChange={(e) => setText(e.target.value)}
          />

          {/* BOTONES */}
          <Stack direction="row" spacing={2}>

            {currentPhrase && (
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
              >
                Eliminar
              </Button>
            )}

            <Button
              variant="contained"
              color="success"
              onClick={handleSubmit}
            >
              {currentPhrase ? "Actualizar" : "Crear"}
            </Button>

          </Stack>

        </Stack>

      </Paper>

      {/* SNACKBAR */}
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

    </Container>
  );
}