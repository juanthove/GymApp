import { useEffect, useState } from "react";

import {
  getAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement
} from "../services/achievementService";

import { getUserLevels } from "../services/userLevelService";
import { getExercises } from "../services/exerciseService";

import { muscleLabels } from "../config/muscleConfig";

import {
  Container,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Divider,
  Box
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";

import BackButton from "../components/BackButton";
import AppSnackbar from "../components/AppSnackbar";

export default function CreateAchievementScreen() {

  const [levels, setLevels] = useState([]);
  const [exercises, setExercises] = useState([]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const muscleOptions = Object.keys(muscleLabels);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [levelsData, achievementsData, exercisesData] = await Promise.all([
      getUserLevels(),
      getAchievements(),
      getExercises()
    ]);

    // agrupar logros por nivel
    const levelsWithAchievements = levelsData.map(level => ({
      ...level,
      achievements: achievementsData
        .filter(a => a.levelId === level.id)
        .map(a => ({
          ...a,
          exercise: exercisesData.find(ex => ex.id === a.exerciseId) || null
        }))
    }));

    setLevels(levelsWithAchievements);
    setExercises(exercisesData);
  };

  const updateAchievementField = (levelIndex, achIndex, field, value) => {
    setLevels(prev => {

      const updated = [...prev];

      updated[levelIndex] = {
        ...updated[levelIndex],
        achievements: [...updated[levelIndex].achievements]
      };

      updated[levelIndex].achievements[achIndex] = {
        ...updated[levelIndex].achievements[achIndex],
        [field]: value
      };

      return updated;
    });
  };

  const addAchievement = (levelIndex) => {
    const updated = [...levels];

    updated[levelIndex].achievements.push({
      id: null,
      name: "",
      type: "VOLUME",
      requiredValue: "",
      muscle: "",
      exercise: null
    });

    setLevels(updated);
  };

  const removeAchievement = async (levelIndex, achIndex) => {
    const updated = [...levels];
    const ach = updated[levelIndex].achievements[achIndex];

    if (ach.id) {
      await deleteAchievement(ach.id);
    }

    updated[levelIndex].achievements.splice(achIndex, 1);
    setLevels(updated);
  };

  const saveAll = async () => {
    if (!validateAchievements()) return;

    try {

      for (const level of levels) {

        for (const ach of level.achievements) {

          const payload = {
            name: ach.name,
            type: ach.type,
            levelId: level.id,
            requiredValue: Number(ach.requiredValue),
            muscle: ach.muscle || null,
            exerciseId: ach.exercise ? ach.exercise.id : null
          };

          if (ach.id) {
            await updateAchievement(ach.id, payload);
          } else {
            await createAchievement(payload);
          }

        }

      }

      setMessage("Logros guardados correctamente");
      setMessageType("success");

      loadData();

    } catch (e) {
      setMessage("Error: " + e.message);
      setMessageType("error");
    }
  };

  const handleTypeChange = (levelIndex, achIndex, newType) => {
    setLevels(prev => {

      const updated = [...prev];

      updated[levelIndex] = {
        ...updated[levelIndex],
        achievements: [...updated[levelIndex].achievements]
      };

      const ach = {
        ...updated[levelIndex].achievements[achIndex],
        type: newType,
        requiredValue: null // limpiar valor al cambiar tipo
      };

      updated[levelIndex].achievements[achIndex] = ach;

      return updated;
    });
  };

  const validateAchievements = () => {

    const seen = new Set(); // 🔥 para evitar duplicados

    for (const level of levels) {

      for (const ach of level.achievements) {

        // 🔹 Nombre
        if (!ach.name?.trim()) {
          setMessage("Todos los logros deben tener nombre");
          setMessageType("warning");
          return false;
        }

        // 🔹 Tipo
        if (!ach.type) {
          setMessage(`El logro "${ach.name}" debe tener tipo`);
          setMessageType("warning");
          return false;
        }

        // 🔹 Valor requerido
        if (!ach.requiredValue || ach.requiredValue <= 0) {
          setMessage(`El logro "${ach.name}" debe tener un valor válido (> 0)`);
          setMessageType("warning");
          return false;
        }

        // 🔥 VALIDACIONES POR TIPO

        if (ach.type === "VOLUME") {

          // ❗ opcional: evitar mezcla
          if (ach.exercise && ach.muscle) {
            setMessage(`El logro "${ach.name}" no puede tener ejercicio y músculo al mismo tiempo`);
            setMessageType("warning");
            return false;
          }

        }

        if (ach.type === "CONSISTENCY" || ach.type === "STREAK") {

          if (ach.exercise) {
            setMessage(`El logro "${ach.name}" no debe tener ejercicio`);
            setMessageType("warning");
            return false;
          }

          if (ach.muscle) {
            setMessage(`El logro "${ach.name}" no debe tener músculo`);
            setMessageType("warning");
            return false;
          }

        }

        // 🔥 DUPLICADOS (MUY RECOMENDADO)
        const exerciseKey = ach.exercise?.id ?? ach.exerciseId ?? "none";
        const muscleKey = ach.muscle ? ach.muscle : "none";
        const requiredValue = Number(ach.requiredValue);
        const key = `${level.id}-${ach.type}-${exerciseKey}-${muscleKey}-${requiredValue}`;

        if (seen.has(key)) {
          setMessage(`Tenés logros duplicados en el nivel "${level.name}"`);
          setMessageType("warning");
          return false;
        }

        seen.add(key);

      }

    }

    return true;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>

      <Paper sx={{ p: 4 }}>

        <Box sx={{ position: "relative", mb: 2 }}>
          <Box sx={{ position: "absolute", left: 0 }}>
            <BackButton to="/admin" sx={{ color: "black" }} />
          </Box>

          <Typography variant="h4" align="center">
            Logros
          </Typography>
        </Box>

        <Stack spacing={3}>

          {levels.map((level, levelIndex) => (

            <Accordion key={level.id}>

              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{level.name}</Typography>
              </AccordionSummary>

              <AccordionDetails>

                <Stack spacing={2}>

                  {level.achievements.map((ach, achIndex) => (

                    <Accordion key={ach.id || ach.tempId}>

                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ width: "100%" }}
                        >
                          <Typography>
                            {ach.name || `Logro ${achIndex + 1}`}
                          </Typography>

                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation(); // 🔥 evita que abra/cierre el accordion
                              removeAchievement(levelIndex, achIndex);
                            }}
                          >
                            <DeleteIcon color="error" />
                          </IconButton>
                        </Stack>

                      </AccordionSummary>

                      <AccordionDetails>

                        <Stack spacing={2}>

                          <TextField
                            label="Nombre"
                            value={ach.name || ""}
                            onChange={(e) =>
                              updateAchievementField(levelIndex, achIndex, "name", e.target.value)
                            }
                          />

                          <TextField
                            select
                            label="Tipo"
                            value={ach.type || ""}
                            onChange={(e) =>
                              handleTypeChange(levelIndex, achIndex, e.target.value)
                            }
                          >
                            <MenuItem value="VOLUME">Volumen</MenuItem>
                            <MenuItem value="CONSISTENCY">Consistencia</MenuItem>
                            <MenuItem value="STREAK">Racha</MenuItem>
                          </TextField>

                          <TextField
                            type="number"
                            label={
                              ach.type === "VOLUME"
                                ? "Peso requerido"
                                : ach.type === "STREAK"
                                  ? "Días consecutivos"
                                  : "Días totales"
                            }
                            value={ach.requiredValue || ""}
                            onChange={(e) =>
                              updateAchievementField(levelIndex, achIndex, "requiredValue", e.target.value)
                            }
                          />

                          <TextField
                            select
                            label="Músculo"
                            value={ach.muscle || ""}
                            onChange={(e) =>
                              updateAchievementField(levelIndex, achIndex, "muscle", e.target.value)
                            }
                          >
                            <MenuItem value="">Ninguno</MenuItem>

                            {Object.entries(muscleLabels).map(([key, label]) => (
                              <MenuItem key={key} value={key}>
                                {label}
                              </MenuItem>
                            ))}
                          </TextField>

                          <TextField
                            select
                            label="Ejercicio"
                            value={ach.exercise?.id || ""}
                            onChange={(e) => {
                              const ex = exercises.find(x => x.id === e.target.value);
                              updateAchievementField(levelIndex, achIndex, "exercise", ex);
                            }}
                          >
                            <MenuItem value="">Ninguno</MenuItem>

                            {exercises.map(ex => (
                              <MenuItem key={ex.id} value={ex.id}>
                                {ex.name}
                              </MenuItem>
                            ))}
                          </TextField>

                        </Stack>

                      </AccordionDetails>

                    </Accordion>

                  ))}

                  <Button
                    variant="contained"
                    onClick={() => addAchievement(levelIndex)}
                  >
                    Agregar logro
                  </Button>

                </Stack>

              </AccordionDetails>

            </Accordion>

          ))}

          <Divider />

          <Button variant="contained" color="success" onClick={saveAll}>
            Guardar todos los logros
          </Button>

          <AppSnackbar
            message={message}
            type={messageType}
            onClose={() => setMessage("")}
          />

        </Stack>

      </Paper>

    </Container>
  );
}