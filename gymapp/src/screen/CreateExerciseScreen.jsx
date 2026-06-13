import { useEffect, useState } from "react";
import useRequireAuth from "../hooks/useRequireAuth";

import backgroundImg from "../assets/gymproIcon.png";

import {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
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
  Checkbox,
  FormControlLabel,
  Box,
  Autocomplete,
} from "@mui/material";

import BackButton from "../components/BackButton";
import FileUploadField from "../components/FileUploadField";
import AppSnackbar from "../components/AppSnackbar";

import { muscleLabels } from "../config/muscleConfig";

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

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const [fileKey, setFileKey] = useState(0);

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

  const typeOptions = [
    { value: "PRIMARY", label: "Primario" },
    { value: "SECONDARY", label: "Secundario" },
    { value: "TERTIARY", label: "Terciario" },
    { value: "ABDOMINAL", label: "Abdominal" },
  ];

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const data = await getExercises();
    setExercises(data);
  };

  const resetForm = () => {
    setSelectedId("new");
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
    setFileKey((prev) => prev + 3);
  };

  const formatExerciseType = (type) => {
    const map = {
      PRIMARY: "Primario",
      SECONDARY: "Secundario",
      TERTIARY: "Terciario",
      ABDOMINAL: "Abdominal",
    };

    return map[type] || type;
  };

  const handleSelect = (id) => {
    setSelectedId(id);

    if (id === "new") {
      resetForm();
      return;
    }

    const ex = exercises.find((e) => e.id === Number(id));

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
      setMessage("El nombre del ejercicio es obligatorio");
      setMessageType("warning");
      return;
    }

    if (!muscle) {
      setMessage("El músculo es obligatorio");
      setMessageType("warning");
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

        setMessage("Ejercicio registrado correctamente");
        setMessageType("success");
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

        setMessage("Ejercicio actualizado correctamente");
        setMessageType("success");
      }

      resetForm();
      loadExercises();
    } catch (err) {
      setMessage("Error al guardar el ejercicio");
      setMessageType("error");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar ejercicio?")) return;

    try {
      await deleteExercise(selectedId);

      setMessage("Ejercicio eliminado");
      setMessageType("success");

      resetForm();
      loadExercises();
    } catch {
      setMessage("Error al eliminar ejercicio");
      setMessageType("error");
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
            <TextField
              select
              label="Seleccionar ejercicio"
              value={selectedId}
              onChange={(e) => handleSelect(e.target.value)}
            >
              <MenuItem value="new">Nuevo ejercicio</MenuItem>

              {exercises.map((ex) => (
                <MenuItem key={ex.id} value={ex.id}>
                  {ex.name} ({formatExerciseType(ex.type)})
                </MenuItem>
              ))}
            </TextField>

            <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />

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
              renderInput={(params) => <TextField {...params} label="Tipo de ejercicio" />}
            />

            {/* ICON */}

            <FileUploadField
              label="Icono"
              accept="image/*"
              setFile={setIcon}
              preview={iconPreview}
              setPreview={setIconPreview}
              existingUrl={currentExercise?.icon && `/api/exercises/icon/${currentExercise.icon}`}
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

            <AppSnackbar message={message} type={messageType} onClose={() => setMessage("")} />

            <Stack direction="row" spacing={2}>
              {selectedId !== "new" && (
                <Button variant="contained" color="error" onClick={handleDelete}>
                  Eliminar ejercicio
                </Button>
              )}

              <Button variant="contained" color="success" onClick={handleSubmit}>
                {selectedId === "new" ? "Registrar ejercicio" : "Actualizar ejercicio"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
