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
  Alert
} from "@mui/material";

import BackButton from "../components/BackButton";

export default function CreateExerciseScreen(){

  const [exercises,setExercises] = useState([]);
  const [selectedId,setSelectedId] = useState("new");

  const [name,setName] = useState("");
  const [description,setDescription] = useState("");
  const [type,setType] = useState("PRIMARY");

  const [image,setImage] = useState(null);
  const [video,setVideo] = useState(null);

  const [deleteImage,setDeleteImage] = useState(false);
  const [deleteVideo,setDeleteVideo] = useState(false);

  const [currentExercise,setCurrentExercise] = useState(null);

  const [message,setMessage] = useState("");
  const [messageType,setMessageType] = useState("info");

  const [fileKey,setFileKey] = useState(0);

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
    setImage(null);
    setVideo(null);
    setDeleteImage(false);
    setDeleteVideo(false);
    setCurrentExercise(null);
    setFileKey(prev=>prev+2);
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
    setType(ex.type || "PRIMARY");

    setDeleteImage(false);
    setDeleteVideo(false);
  };

  const handleSubmit = async (e)=>{
    e.preventDefault();

    if(!name.trim()){
      setMessage("El nombre del ejercicio es obligatorio");
      setMessageType("warning");
      return;
    }

    try{

      if(selectedId==="new"){

        await createExercise({
          name,
          description,
          type,
          image,
          video
        });

        setMessage("Ejercicio registrado correctamente");
        setMessageType("success");

      }else{

        await updateExercise(selectedId,{
          name,
          description,
          type,
          image,
          video,
          deleteImage,
          deleteVideo
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

        <Stack direction="row" alignItems="center" spacing={1} sx={{mb:2}}>
        
          <BackButton to="/admin" />
          
          <Typography variant="h4" gutterBottom>
            Ejercicios
          </Typography>
        
        </Stack>

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

          <Typography variant="subtitle1">
            Imagen
          </Typography>

          <input
            key={fileKey}
            type="file"
            accept="image/*"
            onChange={(e)=>setImage(e.target.files[0])}
          />

          {currentExercise?.image && selectedId!=="new" &&

            <FormControlLabel
              control={
                <Checkbox
                  checked={deleteImage}
                  onChange={()=>setDeleteImage(!deleteImage)}
                />
              }
              label="Eliminar imagen"
            />

          }

          {currentExercise?.image && !deleteImage &&

            <img
              src={getExerciseImageUrl(currentExercise.image)}
              style={{
                maxWidth:"300px",
                borderRadius:"8px"
              }}
            />

          }

          <Typography variant="subtitle1">
            Video
          </Typography>

          <input
            key={fileKey+1}
            type="file"
            accept="video/*"
            onChange={(e)=>setVideo(e.target.files[0])}
          />

          {currentExercise?.video && selectedId!=="new" &&

            <FormControlLabel
              control={
                <Checkbox
                  checked={deleteVideo}
                  onChange={()=>setDeleteVideo(!deleteVideo)}
                />
              }
              label="Eliminar video"
            />

          }

          {currentExercise?.video && !deleteVideo &&

            <video
              src={getExerciseVideoUrl(currentExercise.video)}
              controls
              style={{
                maxWidth:"400px",
                borderRadius:"8px"
              }}
            />

          }

          {message &&
            <Alert severity={messageType}>
              {message}
            </Alert>
          }

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