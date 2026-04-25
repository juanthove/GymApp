import { useEffect, useState } from "react";

import {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  getExerciseImageUrl,
  getExerciseVideoUrl
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
  Alert,
  Snackbar,
  Box
} from "@mui/material";

import BackButton from "../components/BackButton";
import FileUploadField from "../components/FileUploadField";

export default function CreateExerciseScreen(){

  const [exercises,setExercises] = useState([]);
  const [selectedId,setSelectedId] = useState("new");

  const [name,setName] = useState("");
  const [description,setDescription] = useState("");
  const [muscle,setMuscle] = useState("");
  const [type,setType] = useState("PRIMARY");

  const [image,setImage] = useState(null);
  const [video,setVideo] = useState(null);
  const [icon,setIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const [deleteImage,setDeleteImage] = useState(false);
  const [deleteVideo,setDeleteVideo] = useState(false);
  const [deleteIcon,setDeleteIcon] = useState(false);

  const [currentExercise,setCurrentExercise] = useState(null);

  const [message,setMessage] = useState("");
  const [messageType,setMessageType] = useState("info");

  const [fileKey,setFileKey] = useState(0);

   useEffect(() => {
    return () => {
      if (iconPreview) URL.revokeObjectURL(iconPreview);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [iconPreview, imagePreview, videoPreview]);

  const muscleOptions = [
    { value: "CHEST", label: "Pecho" },
    { value: "BACK", label: "Espalda" },
    { value: "SHOULDERS", label: "Hombros" },
    { value: "BICEPS", label: "Bíceps" },
    { value: "TRICEPS", label: "Tríceps" },
    { value: "FOREARMS", label: "Antebrazos" },
    { value: "QUADRICEPS", label: "Cuádriceps" },
    { value: "GLUTES", label: "Glúteos" },
    { value: "HAMSTRINGS", label: "Femorales" },
    { value: "ADDUCTORS", label: "Aductores" },
    { value: "ABDUCTORS", label: "Abductores" },
    { value: "CALVES", label: "Gemelos" },
    { value: "ABDOMINALS", label: "Abdominales" }
  ];

  useEffect(()=>{
    loadExercises();
  },[]);

  const loadExercises = async ()=>{
    const data = await getExercises();
    setExercises(data);
  };

  const resetForm = ()=>{
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
    setFileKey(prev=>prev+3);
  };

  const formatExerciseType = (type)=>{

  const map = {
    PRIMARY:"Primario",
    SECONDARY:"Secundario",
    TERTIARY:"Terciario",
    ABDOMINAL:"Abdominal"
  };

  return map[type] || type;

};

  const handleSelect = (id)=>{

    setSelectedId(id);

    if(id==="new"){
      resetForm();
      return;
    }

    const ex = exercises.find(e=>e.id===Number(id));

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

  const handleSubmit = async (e)=>{
    e.preventDefault();

    if(!name.trim()){
      setMessage("El nombre del ejercicio es obligatorio");
      setMessageType("warning");
      return;
    }

    if(!muscle){
      setMessage("El músculo es obligatorio");
      setMessageType("warning");
      return;
    }

    try{

      if(selectedId==="new"){

        await createExercise({
          name,
          description,
          muscle,
          type,
          image,
          video,
          icon
        });

        setMessage("Ejercicio registrado correctamente");
        setMessageType("success");

      }else{

        await updateExercise(selectedId,{
          name,
          description,
          muscle,
          type,
          image,
          video,
          icon,
          deleteImage,
          deleteVideo,
          deleteIcon
        });

        setMessage("Ejercicio actualizado correctamente");
        setMessageType("success");
      }

      resetForm();
      loadExercises();

    }catch(err){

      setMessage("Error al guardar el ejercicio");
      setMessageType("error");

    }

  };

  const handleDelete = async ()=>{

    if(!window.confirm("¿Eliminar ejercicio?")) return;

    try{

      await deleteExercise(selectedId);

      setMessage("Ejercicio eliminado");
      setMessageType("success");

      resetForm();
      loadExercises();

    }catch{

      setMessage("Error al eliminar ejercicio");
      setMessageType("error");

    }

  };

  return (

    <Container maxWidth="md" sx={{mt:4,mb:6}}>

      <Paper sx={{p:4}}>

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
            Ejercicios
          </Typography>

        </Box>

        <Stack spacing={3}>

          <TextField
            select
            label="Seleccionar ejercicio"
            value={selectedId}
            onChange={(e)=>handleSelect(e.target.value)}
          >

            <MenuItem value="new">Nuevo ejercicio</MenuItem>

            {exercises.map(ex=>(
              <MenuItem key={ex.id} value={ex.id}>
                {ex.name} ({formatExerciseType(ex.type)})
              </MenuItem>
            ))}

          </TextField>

          <TextField
            label="Nombre"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />

          <TextField
            label="Descripción"
            multiline
            minRows={3}
            value={description}
            onChange={(e)=>setDescription(e.target.value)}
          />

          <TextField
            select
            label="Músculo trabajado"
            value={muscle}
            onChange={(e)=>setMuscle(e.target.value)}
          >

            {muscleOptions.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}

          </TextField>

          {/* SELECT TIPO DE EJERCICIO */}

          <TextField
            select
            label="Tipo de ejercicio"
            value={type}
            onChange={(e)=>setType(e.target.value)}
          >

            <MenuItem value="PRIMARY">
              Primario
            </MenuItem>

            <MenuItem value="SECONDARY">
              Secundario
            </MenuItem>

            <MenuItem value="TERTIARY">
              Terciario
            </MenuItem>

            <MenuItem value="ABDOMINAL">
              Abdominal
            </MenuItem>

          </TextField>


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
            renderPreview={(src)=>(
              <img src={src} style={{ maxWidth:"100px", borderRadius:"8px" }} />
            )}
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
            renderPreview={(src)=>(
              <img src={src} style={{ maxWidth:"300px", borderRadius:"8px" }} />
            )}
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
            renderPreview={(src)=>(
              <video src={src} controls style={{ maxWidth:"400px" }} />
            )}
          />

          <Snackbar
            open={!!message}
            autoHideDuration={3000}
            onClose={()=>setMessage("")}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert severity={messageType} sx={{ width: "100%" }}>
              {message}
            </Alert>
          </Snackbar>

          <Stack direction="row" spacing={2}>

            {selectedId!=="new" &&
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
              >
                Eliminar ejercicio
              </Button>
            }

            <Button
              variant="contained"
              color="success"
              onClick={handleSubmit}
            >
              {selectedId==="new"
                ? "Registrar ejercicio"
                : "Actualizar ejercicio"}
            </Button>

          </Stack>

        </Stack>

      </Paper>

    </Container>

  );
}