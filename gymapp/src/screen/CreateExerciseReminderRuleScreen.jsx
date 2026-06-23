import { useState, useEffect } from "react";
import useRequireAuth from "../hooks/useRequireAuth";

import backgroundImg from "../assets/gymproIcon.png";

import { getExercises } from "../services/exerciseService";

import {
  getExerciseReminderRules,
  createExerciseReminderRule,
  updateExerciseReminderRule,
  deleteExerciseReminderRule,
} from "../services/exerciseReminderRuleService";

import { Container, Paper, Typography, TextField, MenuItem, Button, Stack, Box } from "@mui/material";

import BackButton from "../components/BackButton";
import AppSnackbar from "../components/AppSnackbar";
import ExerciseSelectionModal from "../components/ExerciseSelectionModal";

export default function CreateExerciseReminderRuleScreen() {
  useRequireAuth();

  const [rules, setRules] = useState([]);
  const [exercises, setExercises] = useState([]);

  const [selectedId, setSelectedId] = useState("new");
  const [currentRule, setCurrentRule] = useState(null);

  const [name, setName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [weeks, setWeeks] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [rulesData, exercisesData] = await Promise.all([getExerciseReminderRules(), getExercises()]);

    setRules(rulesData);
    setExercises(exercisesData);
  };

  const resetForm = () => {
    setSelectedId("new");
    setCurrentRule(null);
    setName("");
    setSelectedExercises([]);
    setWeeks("");
  };

  const handleSelect = (id) => {
    setSelectedId(id);

    if (id === "new") {
      resetForm();
      return;
    }

    const rule = rules.find((r) => r.id === Number(id));

    if (!rule) return;

    setCurrentRule(rule);
    setName(rule.name);

    setSelectedExercises(exercises.filter((e) => rule.exerciseIds.includes(e.id)));

    setWeeks(rule.weeks);
  };

  const validateForm = () => {
    if (!name.trim()) {
      setMessage("Debes ingresar un nombre");
      setMessageType("warning");
      return false;
    }

    if (selectedExercises.length === 0) {
      setMessage("Debes seleccionar al menos un ejercicio");
      setMessageType("warning");
      return false;
    }

    if (!weeks || Number(weeks) <= 0) {
      setMessage("El intervalo debe ser mayor a 0 semanas");
      setMessageType("warning");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const payload = {
        name: name.trim(),
        exerciseIds: selectedExercises.map((e) => e.id),
        weeks: Number(weeks),
      };

      if (selectedId === "new") {
        await createExerciseReminderRule(payload);

        setMessage("Regla creada correctamente");
        setMessageType("success");
      } else {
        await updateExerciseReminderRule(selectedId, payload);

        setMessage("Regla actualizada correctamente");
        setMessageType("success");
      }

      resetForm();
      await loadData();
    } catch (error) {
      setMessage("Error: " + error.message);
      setMessageType("error");
    }
  };

  const handleDelete = async () => {
    if (!currentRule) return;

    if (window.confirm("¿Seguro que deseas eliminar esta regla?")) {
      try {
        await deleteExerciseReminderRule(currentRule.id);

        setMessage("Regla eliminada correctamente");
        setMessageType("success");

        resetForm();
        await loadData();
      } catch {
        setMessage("Error al eliminar regla");
        setMessageType("error");
      }
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

      <Box
        sx={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(44, 44, 44, 0.4)",
          backdropFilter: "blur(6px)",
          zIndex: 1,
        }}
      />

      <Container
        maxWidth="sm"
        sx={{
          mt: 4,
          mb: 6,
          position: "relative",
          zIndex: 2,
        }}
      >
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
            <Box sx={{ position: "absolute", left: 0 }}>
              <BackButton to="/admin" sx={{ color: "black" }} />
            </Box>

            <Typography variant="h4" sx={{ transform: "translateY(-2px)" }}>
              Avisos de ejercicios
            </Typography>
          </Box>

          <Stack spacing={3}>
            <TextField
              select
              label="Seleccionar regla"
              value={selectedId}
              onChange={(e) => handleSelect(e.target.value)}
            >
              <MenuItem value="new">Nueva regla</MenuItem>

              {rules.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name} — Cada {r.weeks} semanas
                </MenuItem>
              ))}
            </TextField>

            <TextField label="Nombre de la regla" value={name} onChange={(e) => setName(e.target.value)} />

            <Button variant="contained" color="primary" onClick={() => setExerciseModalOpen(true)}>
              Seleccionar ejercicios
            </Button>

            {selectedExercises.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography fontWeight={700} mb={1}>
                  Ejercicios seleccionados
                </Typography>

                {selectedExercises.map((ex) => (
                  <Typography key={ex.id}>{ex.name}</Typography>
                ))}
              </Paper>
            )}

            <TextField
              label="Cada cuántas semanas"
              type="number"
              value={weeks}
              onChange={(e) => setWeeks(e.target.value)}
              inputProps={{ min: 1 }}
            />

            <Stack direction="row" spacing={2}>
              {currentRule && (
                <Button variant="contained" color="error" onClick={handleDelete}>
                  Eliminar
                </Button>
              )}

              <Button variant="contained" color="success" onClick={handleSubmit}>
                {currentRule ? "Actualizar" : "Crear"}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <ExerciseSelectionModal
          open={exerciseModalOpen}
          onClose={() => setExerciseModalOpen(false)}
          initialSelected={selectedExercises}
          exercises={exercises}
          onConfirm={(selected) => {
            setSelectedExercises(selected);
          }}
        />

        <AppSnackbar message={message} type={messageType} onClose={() => setMessage("")} />
      </Container>
    </Box>
  );
}
