import { useState, useEffect } from "react";

import {
  getExercises
} from "../services/exerciseService";

import {
  getExerciseReminderRules,
  createExerciseReminderRule,
  updateExerciseReminderRule,
  deleteExerciseReminderRule
} from "../services/exerciseReminderRuleService";

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

export default function CreateExerciseReminderRuleScreen() {

  const [rules, setRules] = useState([]);
  const [exercises, setExercises] = useState([]);

  const [selectedId, setSelectedId] = useState("new");
  const [currentRule, setCurrentRule] = useState(null);

  const [exerciseId, setExerciseId] = useState("");
  const [weeks, setWeeks] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [rulesData, exercisesData] = await Promise.all([
      getExerciseReminderRules(),
      getExercises()
    ]);

    setRules(rulesData);
    setExercises(exercisesData);
  };

  const resetForm = () => {
    setSelectedId("new");
    setCurrentRule(null);
    setExerciseId("");
    setWeeks("");
  };

  const handleSelect = (id) => {
    setSelectedId(id);

    if (id === "new") {
      resetForm();
      return;
    }

    const rule = rules.find(r => r.id === Number(id));

    setCurrentRule(rule);
    setExerciseId(rule.exerciseId);
    setWeeks(rule.weeks);
  };

  const validateForm = () => {
    if (!exerciseId) {
      setMessage("Debes seleccionar un ejercicio");
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
        exerciseId: Number(exerciseId),
        weeks: Number(weeks)
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
      loadData();

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
        loadData();

      } catch {
        setMessage("Error al eliminar regla");
        setMessageType("error");
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>

      <Paper sx={{ p: 4 }}>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <BackButton to="/admin" />
          <Typography variant="h4">
            Reminder Rules
          </Typography>
        </Stack>

        <Stack spacing={3}>

          {/* SELECT RULE */}
          <TextField
            select
            label="Seleccionar regla"
            value={selectedId}
            onChange={(e) => handleSelect(e.target.value)}
          >
            <MenuItem value="new">Nueva regla</MenuItem>

            {rules.map(r => {
              const ex = exercises.find(e => e.id === r.exerciseId);

              return (
                <MenuItem key={r.id} value={r.id}>
                  {ex ? ex.name : `Ejercicio ${r.exerciseId}`} — Cada {r.weeks} semanas
                </MenuItem>
              );
            })}
          </TextField>

          {/* SELECT EXERCISE */}
          <TextField
            select
            label="Ejercicio"
            value={exerciseId}
            onChange={(e) => setExerciseId(e.target.value)}
          >
            {exercises.map(ex => (
              <MenuItem key={ex.id} value={ex.id}>
                {ex.name}
              </MenuItem>
            ))}
          </TextField>

          {/* WEEKS INPUT */}
          <TextField
            label="Cada cuántas semanas"
            type="number"
            value={weeks}
            onChange={(e) => setWeeks(e.target.value)}
            inputProps={{ min: 1 }}
          />

          {/* BOTONES */}
          <Stack direction="row" spacing={2}>

            {currentRule && (
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
              {currentRule ? "Actualizar" : "Crear"}
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