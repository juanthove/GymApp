import { useEffect, useState, useRef } from "react";
import useRequireAuth from "../hooks/useRequireAuth";
import useSnackbar from "../hooks/useSnackbar";

import backgroundImg from "../assets/gymproIcon.png";

import {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  getExerciseIconUrl,
  getExerciseImageUrl,
  getExerciseVideoUrl,
} from "../services/exerciseService";

import {
  Container,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Box,
  Autocomplete,
  Tabs,
  Tab,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import BackButton from "../components/BackButton";
import FileUploadField from "../components/FileUploadField";
import AppSnackbar from "../components/AppSnackbar";
import ConfirmDialog from "../components/ConfirmDialog";
import AnimatedDialog from "../components/AnimatedDialog";

import { muscleLabels, typeLabels } from "../config/muscleConfig";
import { normalizeText } from "../utils/stringUtils";

export default function CreateExerciseScreen() {
  useRequireAuth();
  const [exercises, setExercises] = useState([]);
  const [selectedId, setSelectedId] = useState("new");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [muscle, setMuscle] = useState("");
  const [type, setType] = useState("PRIMARY");

  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [icon, setIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const [deleteImage, setDeleteImage] = useState(false);
  const [deleteVideo, setDeleteVideo] = useState(false);
  const [deleteIcon, setDeleteIcon] = useState(false);

  const [currentExercise, setCurrentExercise] = useState(null);
  const [exerciseSearch, setExerciseSearch] = useState("");

  const nameInputRef = useRef(null);

  const [isSelectionModalOpen, setSelectionModalOpen] = useState(false);

  const [filterName, setFilterName] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterMuscle, setFilterMuscle] = useState("ALL");

  const { message, messageType, showMessage, clearMessage } = useSnackbar();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (iconPreview) URL.revokeObjectURL(iconPreview);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [iconPreview, imagePreview, videoPreview]);

  const muscleOptions = Object.entries(muscleLabels).map(([value, label]) => ({
    value,
    label,
  }));

  const typeOptions = Object.entries(typeLabels).map(([value, label]) => ({
    value,
    label,
  }));

  const availableMuscles = ["ALL", ...new Set(exercises.map((e) => e.muscle).filter(Boolean))];

  const filteredExercises = exercises.filter((ex) => {
    const matchesName = normalizeText(ex.name).includes(normalizeText(filterName));

    const matchesType = filterType === "ALL" || ex.type === filterType;

    const matchesMuscle = filterMuscle === "ALL" || ex.muscle === filterMuscle;

    return matchesName && matchesType && matchesMuscle;
  });

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const data = await getExercises();
    setExercises(data);
  };

  const resetForm = () => {
    setSelectedId("new");
    setExerciseSearch("");
    setName("");
    setDescription("");
    setType("PRIMARY");
    setMuscle("");
    setImage(null);
    setVideo(null);
    setIcon(null);
    setIconPreview(null);
    setImagePreview(null);
    setVideoPreview(null);
    setDeleteImage(false);
    setDeleteVideo(false);
    setDeleteIcon(false);
    setCurrentExercise(null);
  };

  const formatExerciseType = (type) => typeLabels[type] || type;

  const handleSelect = (id) => {
    setSelectedId(id);

    if (id === "new") {
      setExerciseSearch("");
      resetForm();
      return;
    }

    const ex = exercises.find((e) => e.id === Number(id));
    setExerciseSearch(`${ex.name} (${formatExerciseType(ex.type)})`);

    setCurrentExercise(ex);
    setName(ex.name);
    setDescription(ex.description || "");
    setMuscle(ex.muscle || "");
    setType(ex.type || "PRIMARY");

    setIconPreview(null);
    setImagePreview(null);
    setVideoPreview(null);

    setDeleteImage(false);
    setDeleteVideo(false);
    setDeleteIcon(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showMessage("El nombre del ejercicio es obligatorio", "warning");
      return;
    }

    if (!muscle) {
      showMessage("El músculo es obligatorio", "warning");
      return;
    }

    try {
      if (selectedId === "new") {
        await createExercise({
          name,
          description,
          muscle,
          type,
          image,
          video,
          icon,
        });

        showMessage("Ejercicio registrado correctamente", "success");
      } else {
        await updateExercise(selectedId, {
          name,
          description,
          muscle,
          type,
          image,
          video,
          icon,
          deleteImage,
          deleteVideo,
          deleteIcon,
        });

        showMessage("Ejercicio actualizado correctamente", "success");
      }

      resetForm();
      await loadExercises();

      requestAnimationFrame(() => {
        nameInputRef.current?.focus();
      });
    } catch (err) {
      showMessage("Error al guardar el ejercicio", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteExercise(selectedId);

      showMessage("Ejercicio eliminado", "success");

      resetForm();
      await loadExercises();
    } catch {
      showMessage("Error al eliminar ejercicio", "error");
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

            {/* Título centrado */}
            <Typography variant="h4" sx={{ transform: "translateY(-2px)" }}>
              Ejercicios
            </Typography>
          </Box>

          <Stack spacing={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setSelectionModalOpen(true)}
              sx={{
                height: 48,
                justifyContent: "space-between",
                px: 2,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 400,
                color: "text.primary",
                borderColor: "rgba(0,0,0,0.23)",
              }}
            >
              <Typography noWrap>{selectedId === "new" ? "Nuevo ejercicio" : exerciseSearch}</Typography>

              <KeyboardArrowDownIcon />
            </Button>

            <TextField label="Nombre" value={name} inputRef={nameInputRef} onChange={(e) => setName(e.target.value)} />

            <TextField
              label="Descripción"
              multiline
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Autocomplete
              autoHighlight
              options={muscleOptions}
              getOptionLabel={(option) => option.label}
              value={muscleOptions.find((m) => m.value === muscle) || null}
              onChange={(_, newValue) => {
                setMuscle(newValue?.value || "");
              }}
              filterOptions={(options, state) => {
                const search = normalizeText(state.inputValue);

                return options.filter((option) => normalizeText(option.label).startsWith(search));
              }}
              renderInput={(params) => <TextField {...params} label="Músculo trabajado" />}
            />

            {/* SELECT TIPO DE EJERCICIO */}

            <Autocomplete
              autoHighlight
              autoSelect
              selectOnFocus
              clearOnBlur={false}
              options={typeOptions}
              getOptionLabel={(option) => option.label}
              value={typeOptions.find((t) => t.value === type) || null}
              onChange={(_, newValue) => {
                setType(newValue?.value || "");
              }}
              filterOptions={(options, state) => {
                const search = normalizeText(state.inputValue);

                return options.filter((option) => normalizeText(option.label).startsWith(search));
              }}
              renderInput={(params) => <TextField {...params} label="Tipo de ejercicio" />}
            />

            {/* ICON */}

            <FileUploadField
              label="Icono"
              accept="image/*"
              setFile={setIcon}
              preview={iconPreview}
              setPreview={setIconPreview}
              existingUrl={currentExercise?.icon && getExerciseIconUrl(currentExercise.icon)}
              deleteFlag={deleteIcon}
              setDeleteFlag={setDeleteIcon}
              renderPreview={(src) => <img src={src} style={{ maxWidth: "100px", borderRadius: "8px" }} />}
            />

            {/* IMAGE */}

            <FileUploadField
              label="Imagen"
              accept="image/*"
              setFile={setImage}
              preview={imagePreview}
              setPreview={setImagePreview}
              existingUrl={currentExercise?.image && getExerciseImageUrl(currentExercise.image)}
              deleteFlag={deleteImage}
              setDeleteFlag={setDeleteImage}
              renderPreview={(src) => <img src={src} style={{ maxWidth: "300px", borderRadius: "8px" }} />}
            />

            {/* VIDEO */}

            <FileUploadField
              label="Video"
              accept="video/*"
              setFile={setVideo}
              preview={videoPreview}
              setPreview={setVideoPreview}
              existingUrl={currentExercise?.video && getExerciseVideoUrl(currentExercise.video)}
              deleteFlag={deleteVideo}
              setDeleteFlag={setDeleteVideo}
              renderPreview={(src) => <video src={src} controls style={{ maxWidth: "400px" }} />}
            />

            <Stack direction="row" spacing={2}>
              {selectedId !== "new" && (
                <Button variant="contained" color="error" onClick={() => setConfirmDeleteOpen(true)}>
                  Eliminar ejercicio
                </Button>
              )}

              <Button variant="contained" color="success" onClick={handleSubmit}>
                {selectedId === "new" ? "Registrar ejercicio" : "Actualizar ejercicio"}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* MODAL DE SELECCIÓN DE EJERCICIOS */}
        <AnimatedDialog
          open={isSelectionModalOpen}
          onClose={() => setSelectionModalOpen(false)}
          title="Seleccionar ejercicio"
          titleSize="2rem"
          headerSx={{ py: { xs: 0.4, md: 1.5 } }}
          maxWidth={false}
          paperSx={{
            width: { xs: "95%", md: "80%" },
            maxWidth: "900px",
          }}
        >
          <Stack spacing={2}>
            <Stack spacing={1} mb={1} sx={{ mt: 0.8 }}>
              <TextField
                label="Buscar ejercicio"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Ej: Press banca"
              />

              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Tabs
                  value={filterType}
                  onChange={(e, val) => setFilterType(val)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Todos" value="ALL" />
                  <Tab label="Primario" value="PRIMARY" />
                  <Tab label="Secundario" value="SECONDARY" />
                  <Tab label="Terciario" value="TERTIARY" />
                  <Tab label="Abdominal" value="ABDOMINAL" />
                </Tabs>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Tabs
                  value={filterMuscle}
                  onChange={(e, val) => setFilterMuscle(val)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {availableMuscles.map((muscle) => (
                    <Tab
                      key={muscle}
                      value={muscle}
                      label={muscle === "ALL" ? "Todos" : muscleLabels[muscle] || muscle}
                    />
                  ))}
                </Tabs>
              </Box>
            </Stack>

            <Stack spacing={1}>
              {/* Opción Nuevo ejercicio */}
              <Box
                tabIndex={0}
                onClick={() => {
                  handleSelect("new");
                  setSelectionModalOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect("new");
                    setSelectionModalOpen(false);
                  }
                }}
                sx={{
                  minHeight: 120,
                  p: 2,
                  borderRadius: 2,
                  border: `2px solid ${selectedId === "new" ? "#4caf50" : "#ddd"}`,
                  cursor: "pointer",
                  backgroundColor: selectedId === "new" ? "rgba(76,175,80,0.08)" : "#fff",

                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: { xs: 90, md: 110 },
                    height: { xs: 90, md: 110 },
                    ml: 3,
                    flexShrink: 0,
                  }}
                />

                <Box sx={{ flex: 1 }}>
                  <Typography
                    fontWeight={700}
                    fontSize={{
                      xs: "1.1rem",
                      md: "1.3rem",
                    }}
                  >
                    Nuevo ejercicio
                  </Typography>

                  <Typography color="text.secondary">Crear un ejercicio desde cero</Typography>
                </Box>
              </Box>

              {filteredExercises.map((ex) => {
                const isSelected = selectedId === ex.id;

                return (
                  <Box
                    key={ex.id}
                    tabIndex={0}
                    onClick={() => {
                      handleSelect(ex.id);
                      setSelectionModalOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelect(ex.id);
                        setSelectionModalOpen(false);
                      }
                    }}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `2px solid ${isSelected ? "#4caf50" : "#ddd"}`,
                      cursor: "pointer",
                      backgroundColor: isSelected ? "rgba(76, 175, 80, 0.08)" : "#fff",

                      display: "flex",
                      alignItems: "center",
                      gap: 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 90, md: 110 },
                        height: { xs: 90, md: 110 },
                        flexShrink: 0,
                        ml: 2,

                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {ex.icon && (
                        <Box
                          component="img"
                          src={getExerciseIconUrl(ex.icon)}
                          alt={ex.name}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      )}
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: "1.1rem", md: "1.3rem" },
                        }}
                      >
                        {ex.name}
                      </Typography>

                      <Typography color="text.secondary">
                        {typeLabels[ex.type]}
                        {ex.type !== "ABDOMINAL" && ` | ${muscleLabels[ex.muscle]}`}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Stack>
        </AnimatedDialog>

        {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
        <ConfirmDialog
          open={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          onConfirm={async () => {
            await handleDelete();
            setConfirmDeleteOpen(false);
          }}
          title="Eliminar ejercicio"
          message="¿Estás seguro de que deseas eliminar este ejercicio?"
          confirmText="Eliminar"
          confirmColor="error"
        />

        <AppSnackbar message={message} type={messageType} onClose={clearMessage} />
      </Container>
    </Box>
  );
}
