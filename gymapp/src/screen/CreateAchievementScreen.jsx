import { useEffect, useState } from "react";
import useRequireAuth from "../hooks/useRequireAuth";
import useSnackbar from "../hooks/useSnackbar";

import backgroundImg from "../assets/gymproIcon.png";

import {
  getAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
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
  Box,
  Autocomplete,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";

import BackButton from "../components/BackButton";
import AppSnackbar from "../components/AppSnackbar";
import FileUploadField from "../components/FileUploadField";

import { normalizeText } from "../utils/stringUtils";

export default function CreateAchievementScreen() {
  useRequireAuth();
  const [levels, setLevels] = useState([]);
  const [exercises, setExercises] = useState([]);

  const [images, setImages] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [deleteImages, setDeleteImages] = useState({});

  const { message, messageType, showMessage, clearMessage } = useSnackbar();

  useEffect(() => {
    loadData();
  }, []);

  const muscleOptions = [
    { value: "", label: "Ninguno" },
    ...Object.entries(muscleLabels).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  const exerciseOptions = [
    { value: "", label: "Ninguno" },
    ...exercises.map((ex) => ({
      value: ex.id,
      label: ex.name,
    })),
  ];

  const loadData = async () => {
    const [levelsData, achievementsData, exercisesData] = await Promise.all([
      getUserLevels(),
      getAchievements(),
      getExercises(),
    ]);

    //Agrupar logros por nivel
    const levelsWithAchievements = levelsData.map((level) => ({
      ...level,
      achievements: achievementsData
        .filter((a) => a.levelId === level.id)
        .map((a) => ({
          ...a,
          exercise: exercisesData.find((ex) => ex.id === a.exerciseId) || null,
        })),
    }));

    setLevels(levelsWithAchievements);
    setExercises(exercisesData);
  };

  const updateAchievementField = (levelIndex, achIndex, field, value) => {
    setLevels((prev) => {
      const updated = [...prev];

      updated[levelIndex] = {
        ...updated[levelIndex],
        achievements: [...updated[levelIndex].achievements],
      };

      updated[levelIndex].achievements[achIndex] = {
        ...updated[levelIndex].achievements[achIndex],
        [field]: value,
      };

      return updated;
    });
  };

  const addAchievement = (levelIndex) => {
    const updated = [...levels];

    updated[levelIndex].achievements.push({
      id: null,
      tempId: crypto.randomUUID(),
      name: "",
      type: "VOLUME",
      requiredValue: "",
      muscle: "",
      exercise: null,
    });

    setLevels(updated);
  };

  const removeAchievement = async (levelIndex, achIndex) => {
    const updated = [...levels];
    const ach = updated[levelIndex].achievements[achIndex];

    if (ach.id) {
      await deleteAchievement(ach.id);
    }

    const key = getKey(ach);

    setImages((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    setImagePreviews((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    setDeleteImages((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    updated[levelIndex].achievements.splice(achIndex, 1);
    setLevels(updated);
  };

  const saveAll = async () => {
    if (!validateAchievements()) return;

    try {
      for (const level of levels) {
        for (let i = 0; i < level.achievements.length; i++) {
          const ach = level.achievements[i];
          const key = getKey(ach);

          const payload = {
            name: ach.name,
            type: ach.type,
            levelId: level.id,
            requiredValue: Number(ach.requiredValue),
            muscle: ach.muscle || null,
            exerciseId: ach.exercise ? ach.exercise.id : null,
            image: images[key] || null,
            deleteImage: deleteImages[key] || false,
          };

          if (ach.id) {
            await updateAchievement(ach.id, payload);
          } else {
            await createAchievement(payload);
          }
        }
      }

      showMessage("Logros guardados correctamente", "success");

      loadData();

      setImages({});
      setImagePreviews({});
      setDeleteImages({});
    } catch (e) {
      showMessage("Error: " + e.message, "error");
    }
  };

  const handleTypeChange = (levelIndex, achIndex, newType) => {
    setLevels((prev) => {
      const updated = [...prev];

      updated[levelIndex] = {
        ...updated[levelIndex],
        achievements: [...updated[levelIndex].achievements],
      };

      const ach = {
        ...updated[levelIndex].achievements[achIndex],
        type: newType,
        requiredValue: null,
      };

      updated[levelIndex].achievements[achIndex] = ach;

      return updated;
    });
  };

  const validationError = (message) => {
    showMessage(message, "warning");
    return false;
  };

  const validateAchievements = () => {
    const seen = new Set();

    for (const level of levels) {
      for (const ach of level.achievements) {
        //Nombre
        if (!ach.name?.trim()) {
          return validationError("Todos los logros deben tener nombre");
        }

        //Tipo
        if (!ach.type) {
          return validationError(`El logro "${ach.name}" debe tener tipo`);
        }

        //Valor requerido
        if (!ach.requiredValue || ach.requiredValue <= 0) {
          return validationError(`El logro "${ach.name}" debe tener un valor válido (> 0)`);
        }

        //VALIDACIONES POR TIPO

        if (ach.type === "VOLUME") {
          if (ach.exercise && ach.muscle) {
            return validationError(`El logro "${ach.name}" no puede tener ejercicio y músculo al mismo tiempo`);
          }
        }

        if (ach.type === "CONSISTENCY" || ach.type === "STREAK") {
          if (ach.exercise) {
            return validationError(`El logro "${ach.name}" no debe tener ejercicio`);
          }

          if (ach.muscle) {
            return validationError(`El logro "${ach.name}" no debe tener músculo`);
          }
        }

        const exerciseKey = ach.exercise?.id ?? ach.exerciseId ?? "none";
        const muscleKey = ach.muscle ? ach.muscle : "none";
        const requiredValue = Number(ach.requiredValue);
        const key = `${level.id}-${ach.type}-${exerciseKey}-${muscleKey}-${requiredValue}`;

        if (seen.has(key)) {
          return validationError(`Tenés logros duplicados en el nivel "${level.name}"`);
        }

        seen.add(key);
      }
    }

    return true;
  };

  const getKey = (ach) => ach.id ?? ach.tempId;

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
      <Container maxWidth="md" sx={{ mt: 4, mb: 6, position: "relative", zIndex: 2 }}>
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
                            <Typography>{ach.name || `Logro ${achIndex + 1}`}</Typography>

                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
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
                              onChange={(e) => updateAchievementField(levelIndex, achIndex, "name", e.target.value)}
                            />

                            <TextField
                              select
                              label="Tipo"
                              value={ach.type || ""}
                              onChange={(e) => handleTypeChange(levelIndex, achIndex, e.target.value)}
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

                            <Autocomplete
                              autoHighlight
                              options={muscleOptions}
                              getOptionLabel={(option) => option.label}
                              value={muscleOptions.find((m) => m.value === (ach.muscle || "")) || muscleOptions[0]}
                              onChange={(_, newValue) => {
                                updateAchievementField(levelIndex, achIndex, "muscle", newValue?.value || "");
                              }}
                              filterOptions={(options, state) => {
                                const search = normalizeText(state.inputValue);

                                return options.filter((option) => normalizeText(option.label).startsWith(search));
                              }}
                              renderInput={(params) => <TextField {...params} label="Músculo" />}
                            />

                            <Autocomplete
                              autoHighlight
                              options={exerciseOptions}
                              getOptionLabel={(option) => option.label}
                              value={
                                exerciseOptions.find((e) => e.value === (ach.exercise?.id || "")) || exerciseOptions[0]
                              }
                              onChange={(_, newValue) => {
                                const exercise = exercises.find((e) => e.id === newValue?.value) || null;

                                updateAchievementField(levelIndex, achIndex, "exercise", exercise);
                              }}
                              filterOptions={(options, state) => {
                                const search = normalizeText(state.inputValue);

                                return options.filter((option) => normalizeText(option.label).startsWith(search));
                              }}
                              renderInput={(params) => <TextField {...params} label="Ejercicio" />}
                            />

                            <FileUploadField
                              label="Imagen del logro"
                              accept="image/png,image/webp"
                              setFile={(file) => {
                                const key = getKey(ach);
                                setImages((prev) => ({ ...prev, [key]: file }));
                              }}
                              preview={imagePreviews[getKey(ach)]}
                              setPreview={(preview) => {
                                const key = getKey(ach);
                                setImagePreviews((prev) => ({ ...prev, [key]: preview }));
                              }}
                              existingUrl={ach.image ? `/api/achievements/image/${ach.image}` : null}
                              deleteFlag={deleteImages[getKey(ach)] || false}
                              setDeleteFlag={(value) => {
                                const key = getKey(ach);
                                setDeleteImages((prev) => ({ ...prev, [key]: value }));
                              }}
                              renderPreview={(src) => (
                                <img
                                  src={src}
                                  style={{
                                    width: "80px",
                                    height: "80px",
                                    objectFit: "contain",
                                    background: "#f5f5f5",
                                    borderRadius: "10px",
                                    padding: "6px",
                                  }}
                                />
                              )}
                            />
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    ))}

                    <Button variant="contained" onClick={() => addAchievement(levelIndex)}>
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
          </Stack>
        </Paper>
        <AppSnackbar message={message} type={messageType} onClose={clearMessage} />
      </Container>
    </Box>
  );
}
