import { useState, useEffect, useRef } from "react";
import useRequireAuth from "../hooks/useRequireAuth";
import useSnackbar from "../hooks/useSnackbar";

import backgroundImg from "../assets/gymproIcon.png";

import { normalizeText } from "../utils/stringUtils";

import { getUsers, getCurrentWorkout, setCurrentWorkout, getUserById } from "../services/userService";
import { getExercises } from "../services/exerciseService";
import {
  getWorkoutTemplates,
  getWorkoutTemplateById,
  getWorkoutTemplateDayImageUrl,
} from "../services/workoutTemplateService";
import { createWorkout, updateWorkout, getWorkoutById } from "../services/workoutService";
import { uploadWorkoutDayImage, getWorkoutDayImageUrl } from "../services/workoutDayService";
import {
  getWorkoutSaveById,
  getWorkoutSavesByUser,
  createWorkoutSave,
  updateWorkoutSave,
  deleteWorkoutSave,
} from "../services/workoutSaveService";

import AnimatedDialog from "../components/AnimatedDialog";
import ConfirmDialog from "../components/ConfirmDialog";

import {
  Container,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Card,
  CardContent,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Autocomplete,
  LinearProgress,
  Box,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FileCopyIcon from "@mui/icons-material/FileCopy";

import BackButton from "../components/BackButton";
import MuscleChips from "../components/MuscleChips";
import FileUploadField from "../components/FileUploadField";
import AppSnackbar from "../components/AppSnackbar";
import SortableList from "../components/sortable/SortableList";
import SortableItem from "../components/sortable/SortableItem";
import ExerciseSelectionModal from "../components/ExerciseSelectionModal";

export default function CreateWorkoutScreen() {
  useRequireAuth();
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [exercises, setExercises] = useState([]);
  const userInputRef = useRef(null);

  const [selectedUser, setSelectedUser] = useState("");
  const [source, setSource] = useState("empty");

  const [workoutName, setWorkoutName] = useState("");
  const [days, setDays] = useState([]);
  const [gymDaysPerWeek, setGymDaysPerWeek] = useState(0);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [workoutId, setWorkoutId] = useState(null);
  const [hasCurrentWorkout, setHasCurrentWorkout] = useState(false);
  const [isLastWorkout, setIsLastWorkout] = useState(false);
  const [savedWorkouts, setSavedWorkouts] = useState([]);

  const { message, messageType, showMessage, clearMessage } = useSnackbar();

  const [expandedDays, setExpandedDays] = useState([]);

  const [globalReps, setGlobalReps] = useState("");

  const repOptions = [
    { label: "8", value: 8 },
    { label: "12", value: 12 },
    { label: "15", value: 15 },
  ];

  const exercisesById = Object.fromEntries(exercises.map((ex) => [ex.id, ex]));

  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);

  const [favoriteModalOpen, setFavoriteModalOpen] = useState(false);
  const [selectedFavoriteId, setSelectedFavoriteId] = useState("new");
  const [favoriteName, setFavoriteName] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    loadUsers();
    loadTemplates();
    loadExercises();
  }, []);

  const validationError = (message) => {
    showMessage(message, "warning");
    return false;
  };

  const validateWorkout = () => {
    if (!workoutName.trim()) {
      return validationError("El nombre de la plantilla es obligatorio");
    }

    if (!startDate || !endDate) {
      return validationError("Debes seleccionar fecha de inicio y fin");
    }

    if (!globalReps) {
      return validationError("Debes seleccionar las repeticiones del workout");
    }

    if (days.length === 0) {
      return validationError("Debes agregar al menos un día");
    }

    if (gymDaysPerWeek && days.length > gymDaysPerWeek) {
      return validationError(`La planilla tiene ${days.length} días pero el usuario solo entrena ${gymDaysPerWeek}`);
    }

    for (let d = 0; d < days.length; d++) {
      const day = days[d];

      if (!day.name.trim()) {
        return validationError(`El día ${d + 1} debe tener nombre`);
      }

      if (day.exercises.length === 0) {
        return validationError(`El día ${d + 1} debe tener al menos un ejercicio`);
      }

      for (let e = 0; e < day.exercises.length; e++) {
        const ex = day.exercises[e];

        if (ex.weight === "" || ex.weight === null) {
          return validationError(`Un ejercicio del día ${d + 1} necesita peso`);
        }
      }
    }

    return true;
  };

  const resetForm = () => {
    setSource("empty");
    setWorkoutName("");
    setDays([]);
    setStartDate("");
    setEndDate("");
    setWorkoutId(null);
    setIsLastWorkout(false);
    setGlobalReps("");
    setExpandedDays([]);
  };

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  const loadTemplates = async () => {
    const data = await getWorkoutTemplates();
    setTemplates(data);
  };

  const loadSavedWorkouts = async (userId) => {
    try {
      const data = await getWorkoutSavesByUser(userId);
      setSavedWorkouts(data);
    } catch {
      setSavedWorkouts([]);
    }
  };

  const loadExercises = async () => {
    const data = await getExercises();
    setExercises(data);
  };

  const calculateDayMuscles = (dayExercises) => {
    const musclesSet = new Set();

    dayExercises.forEach((ex) => {
      const fullExercise = exercisesById[ex.exerciseId];

      if (fullExercise?.muscle) {
        musclesSet.add(fullExercise.muscle);
      }
    });

    return Array.from(musclesSet);
  };

  const checkCurrentWorkout = async (userId) => {
    try {
      const workout = await getCurrentWorkout(userId);
      setHasCurrentWorkout(!!workout);
    } catch {
      setHasCurrentWorkout(false);
    }
  };

  const mapWorkoutDays = (sourceDays, editable, isTemplate = false) => {
    return sourceDays.map((day) => ({
      id: editable ? day.id : crypto.randomUUID(),
      name: day.name,
      muscles: day.muscles || [],
      dayOrder: day.dayOrder,

      image: null,
      deleteImage: false,

      sourceMuscleImage: day.muscleImage || null,

      preview: day.muscleImage
        ? isTemplate
          ? getWorkoutTemplateDayImageUrl(day.muscleImage)
          : getWorkoutDayImageUrl(day.muscleImage)
        : null,

      exercises: day.exercises
        .sort((a, b) => a.order - b.order)
        .map((ex) => ({
          id: crypto.randomUUID(),
          exerciseId: ex.exerciseId,
          order: ex.order,
          weight: isTemplate ? "" : (ex.nextWeight ?? ex.weight),
        })),
    }));
  };

  const loadTemplate = async (id) => {
    const template = await getWorkoutTemplateById(id);

    setWorkoutId(null);
    setIsLastWorkout(false);

    setDays(mapWorkoutDays(template.days, false, true));
  };

  const loadWorkout = (workout, name, editable) => {
    setWorkoutId(editable ? workout.id : null);
    setIsLastWorkout(editable);

    setWorkoutName(name);
    setGlobalReps(workout.reps || "");

    setStartDate(workout.startDate?.split("T")[0] || "");
    setEndDate(workout.endDate?.split("T")[0] || "");

    setDays(mapWorkoutDays(workout.days, editable));
  };

  const loadLastWorkout = async () => {
    const workoutBasic = await getCurrentWorkout(selectedUser);
    if (!workoutBasic) return;

    const workout = await getWorkoutById(workoutBasic.id);

    loadWorkout(workout, workout.name, true);
  };

  const loadSavedWorkout = async (id) => {
    const save = await getWorkoutSaveById(id);

    const workout = await getWorkoutById(save.workoutId);

    loadWorkout(workout, save.name, false);
  };

  const handleSourceChange = async (value) => {
    setSource(value);

    if (value === "empty") {
      setDays([]);
      setWorkoutName("");
      setWorkoutId(null);
      setIsLastWorkout(false);
    } else if (value === "last") {
      await loadLastWorkout();
    } else if (value.startsWith("saved-")) {
      await loadSavedWorkout(value.split("-")[1]);
    } else if (value.startsWith("template-")) {
      await loadTemplate(value.split("-")[1]);
    }
  };

  const addDay = () => {
    setDays([
      ...days,
      {
        id: crypto.randomUUID(),
        name: `Día ${days.length + 1}`,
        muscles: [],
        exercises: [],
        image: null,
        deleteImage: false,
        sourceMuscleImage: null,
        preview: null,
      },
    ]);
  };

  const removeDay = (index) => {
    const updated = [...days];
    updated.splice(index, 1);
    setDays(updated);
  };

  const moveDay = (index, direction) => {
    const updated = [...days];
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= updated.length) return;

    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    setDays(updated);
  };

  const updateDayField = (index, field, value) => {
    const updated = [...days];
    updated[index][field] = value;
    setDays(updated);
  };

  const removeExerciseFromDay = (dayIndex, exIndex) => {
    const updated = [...days];

    updated[dayIndex].exercises.splice(exIndex, 1);

    updated[dayIndex].exercises = updated[dayIndex].exercises.map((ex, i) => ({
      ...ex,
      order: i + 1,
    }));

    updated[dayIndex].muscles = calculateDayMuscles(updated[dayIndex].exercises);

    setDays(updated);
  };

  const updateExerciseField = (dayIndex, exIndex, field, value) => {
    const updated = [...days];

    updated[dayIndex].exercises[exIndex][field] = value;

    setDays(updated);
  };

  const duplicateDay = (index) => {
    const dayToCopy = days[index];

    const newDay = {
      id: crypto.randomUUID(),
      name: dayToCopy.name + " copia",
      muscles: [...dayToCopy.muscles],
      image: null,
      deleteImage: false,
      sourceMuscleImage: null,
      preview: null,
      exercises: dayToCopy.exercises.map((ex) => ({
        ...ex,
        id: crypto.randomUUID(),
      })),
    };

    const updated = [...days];

    updated.splice(index + 1, 0, newDay);

    setDays(updated);
  };

  const buildWorkoutData = () => ({
    name: workoutName,
    reps: Number(globalReps),
    userId: Number(selectedUser),
    startDate,
    endDate,
    days: days.map((day, index) => ({
      name: day.name,
      muscleImage: day.deleteImage || day.image ? null : day.sourceMuscleImage || null,
      exercises: day.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        weight: ex.weight,
        order: ex.order,
      })),
      dayOrder: index + 1,
    })),
  });

  const uploadDayImages = async (id) => {
    const fullWorkout = await getWorkoutById(id);

    for (let i = 0; i < fullWorkout.days.length; i++) {
      const backendDay = fullWorkout.days[i];
      const frontDay = days[i];

      if (frontDay?.image) {
        await uploadWorkoutDayImage(backendDay.id, frontDay.image);
      }
    }
  };

  const saveWorkout = async (update) => {
    if (!validateWorkout()) return;

    try {
      let id = workoutId;

      if (update) {
        await updateWorkout(workoutId, buildWorkoutData());
      } else {
        const workout = await createWorkout(buildWorkoutData());

        id = workout.id;

        await setCurrentWorkout(Number(selectedUser), id);
      }

      await uploadDayImages(id);

      resetForm();

      requestAnimationFrame(() => {
        userInputRef.current?.focus();
      });

      showMessage(update ? "Planilla actualizada" : "Planilla creada", "success");
    } catch (e) {
      showMessage(e.message, "error");
    }
  };

  const handleFavoriteChange = (value) => {
    setSelectedFavoriteId(value);

    if (value === "new") {
      setFavoriteName("");
      return;
    }

    const save = savedWorkouts.find((s) => s.id === value);

    if (save) {
      setFavoriteName(save.name);
    }
  };

  const handleSaveFavorite = async () => {
    if (!favoriteName.trim()) return;

    if (selectedFavoriteId === "new") {
      await createWorkoutSave({
        name: favoriteName,
        workoutId,
      });
    } else {
      await updateWorkoutSave(selectedFavoriteId, {
        name: favoriteName,
        workoutId,
      });
    }

    await loadSavedWorkouts(selectedUser);

    setFavoriteModalOpen(false);

    showMessage("Favorito guardado", "success");
  };

  const handleDeleteFavorite = async () => {
    if (selectedFavoriteId === "new") return;

    try {
      await deleteWorkoutSave(selectedFavoriteId);

      await loadSavedWorkouts(selectedUser);

      setSelectedFavoriteId("new");
      setFavoriteName("");
      setFavoriteModalOpen(false);

      showMessage("Favorito eliminado", "success");
    } catch (e) {
      showMessage(e.message, "error");
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
      <Container maxWidth="md" sx={{ mt: 4, mb: 6, position: "relative", zIndex: 2 }}>
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

            {/* Título centrado REAL */}
            <Typography variant="h4" sx={{ transform: "translateY(-2px)" }}>
              Crear Planilla
            </Typography>
          </Box>

          <Stack spacing={3}>
            <Autocomplete
              autoHighlight
              options={users}
              getOptionLabel={(option) => `${option.name} ${option.surname}`}
              value={users.find((u) => u.id === Number(selectedUser)) || null}
              onChange={async (_, value) => {
                const userId = value?.id || "";

                setExpandedDays([]);

                resetForm();

                setSelectedUser(userId);

                if (userId) {
                  await checkCurrentWorkout(userId);

                  const user = await getUserById(userId);
                  setGymDaysPerWeek(user.gymDaysPerWeek || 0);

                  await loadSavedWorkouts(userId);
                } else {
                  setSavedWorkouts([]);
                }
              }}
              filterOptions={(options, state) => {
                const search = normalizeText(state.inputValue);

                return options.filter((option) => {
                  const name = normalizeText(option.name);
                  const surname = normalizeText(option.surname);

                  return name.startsWith(search) || surname.startsWith(search);
                });
              }}
              renderInput={(params) => <TextField {...params} label="Usuario" inputRef={userInputRef} />}
            />

            {selectedUser && (
              <TextField select label="Origen" value={source} onChange={(e) => handleSourceChange(e.target.value)}>
                <MenuItem value="empty">Planilla vacía</MenuItem>

                {hasCurrentWorkout && <MenuItem value="last">Última planilla</MenuItem>}

                {savedWorkouts.map((s) => (
                  <MenuItem key={s.id} value={`saved-${s.id}`}>
                    💾 {s.name}
                  </MenuItem>
                ))}

                {templates.map((t) => (
                  <MenuItem key={t.id} value={`template-${t.id}`}>
                    {t.name}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {gymDaysPerWeek > 0 && (
              <Stack spacing={1}>
                <Typography variant="body2" color={days.length > gymDaysPerWeek ? "error" : "textPrimary"}>
                  Días de la planilla: {days.length} / {gymDaysPerWeek}
                </Typography>

                <LinearProgress
                  variant="determinate"
                  color={days.length > gymDaysPerWeek ? "error" : "primary"}
                  value={Math.min((days.length / gymDaysPerWeek) * 100, 100)}
                />
              </Stack>
            )}

            <TextField
              label="Nombre de la planilla"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                type="date"
                label="Fecha inicio"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <TextField
                type="date"
                label="Fecha fin"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              <TextField
                select
                label="Repeticiones globales"
                value={globalReps}
                onChange={(e) => setGlobalReps(e.target.value)}
                sx={{ width: 202 }}
              >
                {repOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {days.map((day, dayIndex) => (
              <Accordion
                key={day.id}
                expanded={expandedDays.includes(day.id)}
                onChange={(event, isExpanded) => {
                  if (isExpanded) {
                    setExpandedDays((prev) => [...prev, day.id]);
                  } else {
                    setExpandedDays((prev) => prev.filter((id) => id !== day.id));
                  }
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>
                    Día {dayIndex + 1} - {day.name}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="h6">Configuración del día</Typography>

                      <Stack direction="row">
                        <IconButton onClick={() => moveDay(dayIndex, -1)}>
                          <ArrowUpwardIcon />
                        </IconButton>

                        <IconButton onClick={() => moveDay(dayIndex, 1)}>
                          <ArrowDownwardIcon />
                        </IconButton>

                        <IconButton onClick={() => duplicateDay(dayIndex)}>
                          <FileCopyIcon />
                        </IconButton>

                        <IconButton onClick={() => removeDay(dayIndex)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <TextField
                      label="Nombre del día"
                      value={day.name}
                      onChange={(e) => updateDayField(dayIndex, "name", e.target.value)}
                    />

                    <MuscleChips muscles={day.muscles} />

                    <FileUploadField
                      label="Imagen del día"
                      accept="image/*"
                      setFile={(file) => {
                        const updated = [...days];
                        updated[dayIndex].image = file;
                        setDays(updated);
                      }}
                      preview={day.preview}
                      setPreview={(preview) => {
                        const updated = [...days];
                        updated[dayIndex].preview = preview;
                        setDays(updated);
                      }}
                      existingUrl={day.preview && !day.preview.startsWith("blob:") ? day.preview : null}
                      deleteFlag={day.deleteImage}
                      setDeleteFlag={(value) => {
                        const updated = [...days];
                        updated[dayIndex].deleteImage = value;

                        if (value) {
                          updated[dayIndex].image = null;
                        }

                        setDays(updated);
                      }}
                      renderPreview={(src) => (
                        <img
                          src={src}
                          style={{
                            maxWidth: "300px",
                            borderRadius: "8px",
                          }}
                        />
                      )}
                    />

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setSelectedDayIndex(dayIndex);
                        setExerciseModalOpen(true);
                      }}
                    >
                      Seleccionar ejercicios
                    </Button>

                    <Divider />

                    <SortableList
                      items={day.exercises}
                      getId={(item) => item.id}
                      setItems={(newItems) => {
                        const updated = [...days];
                        updated[dayIndex].exercises = newItems.map((ex, i) => ({
                          ...ex,
                          order: i + 1,
                        }));

                        updated[dayIndex].muscles = calculateDayMuscles(updated[dayIndex].exercises);

                        setDays(updated);
                      }}
                    >
                      {day.exercises.map((ex, i) => {
                        const exercise = exercisesById[ex.exerciseId];

                        return (
                          <SortableItem key={ex.id} id={ex.id}>
                            <Card>
                              <CardContent>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                  <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography sx={{ width: 200 }}>
                                      {i + 1}. {exercise?.name}
                                    </Typography>

                                    <TextField
                                      type="number"
                                      label="Peso"
                                      size="small"
                                      value={ex.weight}
                                      onChange={(e) => updateExerciseField(dayIndex, i, "weight", e.target.value)}
                                    />

                                    <IconButton onClick={() => removeExerciseFromDay(dayIndex, i)}>
                                      <DeleteIcon color="error" />
                                    </IconButton>
                                  </Stack>

                                  {/* HANDLE */}
                                  <Box
                                    sx={{
                                      display: "grid",
                                      gridTemplateColumns: "repeat(2, 8px)",
                                      gap: "5px",
                                      cursor: "grab",
                                      mr: 3,
                                    }}
                                  >
                                    {[...Array(6)].map((_, i) => (
                                      <Box
                                        key={i}
                                        sx={{
                                          width: 7,
                                          height: 7,
                                          backgroundColor: "#888",
                                          borderRadius: "50%",
                                        }}
                                      />
                                    ))}
                                  </Box>
                                </Stack>
                              </CardContent>
                            </Card>
                          </SortableItem>
                        );
                      })}
                    </SortableList>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}

            <Button
              variant="contained"
              color="success"
              onClick={addDay}
              disabled={!selectedUser || (gymDaysPerWeek && days.length >= gymDaysPerWeek)}
            >
              Agregar día
            </Button>

            <Stack direction="row" spacing={2}>
              {isLastWorkout && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setSelectedFavoriteId("new");
                      setFavoriteName("");
                      setFavoriteModalOpen(true);
                    }}
                  >
                    Guardar favorito
                  </Button>

                  <Button variant="contained" color="success" onClick={() => saveWorkout(true)}>
                    Actualizar última planilla
                  </Button>
                </>
              )}

              <Button variant="contained" color="success" onClick={() => saveWorkout(false)}>
                Crear nueva planilla
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* MODAL SELECCIÓN DE EJERCICIOS */}
        <ExerciseSelectionModal
          open={exerciseModalOpen}
          onClose={() => setExerciseModalOpen(false)}
          exercises={exercises}
          initialSelected={
            selectedDayIndex !== null
              ? days[selectedDayIndex]?.exercises.map((e) => exercisesById[e.exerciseId]).filter(Boolean)
              : []
          }
          onConfirm={(selectedExercises) => {
            if (selectedDayIndex === null) return;

            const updated = [...days];

            const previousExercises = updated[selectedDayIndex].exercises;

            updated[selectedDayIndex].exercises = selectedExercises.map((ex, index) => {
              const existing = previousExercises.find((e) => e.exerciseId === ex.id);

              return {
                id: existing?.id ?? crypto.randomUUID(),
                exerciseId: ex.id,
                order: index + 1,
                weight: existing?.weight ?? "",
              };
            });

            updated[selectedDayIndex].muscles = calculateDayMuscles(updated[selectedDayIndex].exercises);

            setDays(updated);
          }}
        />

        {/* MODAL FAVORITOS */}
        <AnimatedDialog
          open={favoriteModalOpen}
          onClose={() => setFavoriteModalOpen(false)}
          title="Guardar favorito"
          actions={
            <>
              {selectedFavoriteId !== "new" && (
                <Button variant="contained" color="error" onClick={() => setConfirmDeleteOpen(true)}>
                  Eliminar favorito
                </Button>
              )}

              <Button variant="contained" onClick={handleSaveFavorite} disabled={!favoriteName.trim()}>
                {selectedFavoriteId === "new" ? "Guardar favorito" : "Actualizar favorito"}
              </Button>
            </>
          }
        >
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Favorito"
              value={selectedFavoriteId}
              onChange={(e) => handleFavoriteChange(e.target.value)}
            >
              <MenuItem value="new">Nuevo favorito</MenuItem>

              {savedWorkouts.map((save) => (
                <MenuItem key={save.id} value={save.id}>
                  {save.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Nombre"
              value={favoriteName}
              onChange={(e) => setFavoriteName(e.target.value)}
              fullWidth
            />
          </Stack>
        </AnimatedDialog>

        <ConfirmDialog
          open={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          onConfirm={async () => {
            await handleDeleteFavorite();
            setConfirmDeleteOpen(false);
          }}
          title="Eliminar favorito"
          message="¿Seguro que deseas eliminar este favorito?"
          confirmText="Eliminar"
          confirmColor="error"
        />
        <AppSnackbar message={message} type={messageType} onClose={clearMessage} />
      </Container>
    </Box>
  );
}
