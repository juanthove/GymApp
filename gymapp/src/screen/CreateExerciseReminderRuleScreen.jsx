import { useState, useEffect, useRef } from "react";
import useRequireAuth from "../hooks/useRequireAuth";
import useSnackbar from "../hooks/useSnackbar";

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
import ConfirmDialog from "../components/ConfirmDialog";

export default function CreateExerciseReminderRuleScreen() {
  useRequireAuth();

  const [rules, setRules] = useState([]);
  const [exercises, setExercises] = useState([]);

  const [selectedId, setSelectedId] = useState("new");
  const [currentRule, setCurrentRule] = useState(null);

  const [name, setName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [weeks, setWeeks] = useState("");

  const nameInputRef = useRef(null);

  const { message, messageType, showMessage, clearMessage } = useSnackbar();

  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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

  const validationError = (message) => {
    showMessage(message, "warning");
    return false;
  };

  const validateForm = () => {
    if (!name.trim()) {
      return validationError("Debes ingresar un nombre");
    }

    if (selectedExercises.length === 0) {
      return validationError("Debes seleccionar al menos un ejercicio");
    }

    if (!weeks || Number(weeks) <= 0) {
      return validationError("El intervalo debe ser mayor a 0 semanas");
    }

    return true;
  };

  const saveRule = async (payload) => {
    if (selectedId === "new") {
      await createExerciseReminderRule(payload);
      return "Regla creada correctamente";
    }

    await updateExerciseReminderRule(selectedId, payload);
    return "Regla actualizada correctamente";
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const message = await saveRule({
        name: name.trim(),
        exerciseIds: selectedExercises.map((e) => e.id),
        weeks: Number(weeks),
      });

      showMessage(message, "success");

      resetForm();
      await loadData();

      requestAnimationFrame(() => {
        nameInputRef.current?.focus();
      });
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  const handleDelete = async () => {
    if (!currentRule) return;

    try {
      await deleteExerciseReminderRule(currentRule.id);

      showMessage("Regla eliminada correctamente", "success");

      resetForm();
      await loadData();
    } catch {
      showMessage("Error al eliminar regla", "error");
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

            <TextField
              label="Nombre de la regla"
              value={name}
              inputRef={nameInputRef}
              onChange={(e) => setName(e.target.value)}
            />

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
                <Button variant="contained" color="error" onClick={() => setConfirmDeleteOpen(true)}>
                  Eliminar
                </Button>
              )}

              <Button variant="contained" color="success" onClick={handleSubmit}>
                {currentRule ? "Actualizar" : "Crear"}
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
          title="Eliminar aviso"
          message="¿Estás seguro de que deseas eliminar este aviso?"
          confirmText="Eliminar"
          confirmColor="error"
        />

        {/* MODAL SELECCIÓN DE EJERCICIOS */}
        <ExerciseSelectionModal
          open={exerciseModalOpen}
          onClose={() => setExerciseModalOpen(false)}
          initialSelected={selectedExercises}
          exercises={exercises}
          onConfirm={(selected) => {
            setSelectedExercises(selected);
          }}
        />

        <AppSnackbar message={message} type={messageType} onClose={clearMessage} />
      </Container>
    </Box>
  );
}
