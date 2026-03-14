import React, { useEffect, useState } from "react";
import {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  getExerciseImageUrl,
  getExerciseVideoUrl
} from "../services/exerciseService";

export default function CreateExerciseScreen() {

  const [exercises,setExercises] = useState([]);
  const [selectedId,setSelectedId] = useState("new");

  const [name,setName] = useState("");
  const [description,setDescription] = useState("");

  const [image,setImage] = useState(null);
  const [video,setVideo] = useState(null);

  const [deleteImage,setDeleteImage] = useState(false);
  const [deleteVideo,setDeleteVideo] = useState(false);

  const [currentExercise,setCurrentExercise] = useState(null);

  const [fileKey,setFileKey] = useState(0);

  useEffect(()=>{
    loadExercises();
  },[]);

  const loadExercises = async()=>{
    const data = await getExercises();
    setExercises(data);
  };

  const handleSelect = (id)=>{

    setSelectedId(id);

    if(id==="new"){
      setCurrentExercise(null);
      setName("");
      setDescription("");
      setImage(null);
      setVideo(null);
      setDeleteImage(false);
      setDeleteVideo(false);
      return;
    }

    const ex = exercises.find(e=>e.id===Number(id));

    setCurrentExercise(ex);
    setName(ex.name);
    setDescription(ex.description || "");
    setDeleteImage(false);
    setDeleteVideo(false);
  };

  const handleSubmit = async (e)=>{
    e.preventDefault();

    if(selectedId==="new"){

      await createExercise({
        name,
        description,
        image,
        video
      });

      alert("Ejercicio registrado");

    }else{

      await updateExercise(selectedId,{
        name,
        description,
        image,
        video,
        deleteImage,
        deleteVideo
      });

      alert("Ejercicio actualizado");
    }

    setSelectedId("new");
    setName("");
    setDescription("");
    setImage(null);
    setVideo(null);
    setDeleteImage(false);
    setDeleteVideo(false);
    setCurrentExercise(null);
    setFileKey(prev => prev + 2);
    loadExercises();
  };

  const handleDelete = async()=>{

    if(!window.confirm("Eliminar ejercicio?")) return;

    await deleteExercise(selectedId);

    setSelectedId("new");
    setName("");
    setDescription("");

    loadExercises();
  };

  return (
    <div style={styles.container}>

      <h1 style={styles.title}>Ejercicios</h1>

      <form style={styles.form} onSubmit={handleSubmit}>

        <label style={styles.label}>Seleccionar ejercicio</label>

        <select
          style={styles.input}
          value={selectedId}
          onChange={(e)=>handleSelect(e.target.value)}
        >
          <option value="new">Nuevo ejercicio</option>

          {exercises.map(ex=>(
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}

        </select>

        <label style={styles.label}>Nombre</label>
        <input
          style={styles.input}
          type="text"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          required
        />

        <label style={styles.label}>Descripción</label>
        <textarea
          style={styles.textarea}
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
        />

        <label style={styles.label}>Imagen</label>

        <input
          key={fileKey}
          type="file"
          accept="image/*"
          onChange={(e)=>setImage(e.target.files[0])}
        />

        {currentExercise?.image && selectedId !== "new" && (
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={deleteImage}
              onChange={()=>setDeleteImage(!deleteImage)}
            />
            Eliminar imagen
          </label>
        )}

        {currentExercise?.image && !deleteImage && (
            <div>
                <p>Imagen actual:</p>
                <img
                src={getExerciseImageUrl(currentExercise.image)}
                alt="Ejercicio"
                style={styles.previewImage}
                />
            </div>
        )}

        <label style={styles.label}>Video</label>

        <input
          key={fileKey + 1}
          type="file"
          accept="video/*"
          onChange={(e)=>setVideo(e.target.files[0])}
        />

        {currentExercise?.video && selectedId !== "new" && (
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={deleteVideo}
              onChange={()=>setDeleteVideo(!deleteVideo)}
            />
            Eliminar video
          </label>
        )}

        {currentExercise?.video && !deleteVideo && (
            <div style={styles.previewContainer}>
                <label style={styles.label}>Video actual:</label>
                <video 
                src={getExerciseVideoUrl(currentExercise.video)} 
                controls 
                style={styles.previewVideo}
                />
            </div>
        )}

        <div style={styles.buttons}>

          {selectedId!=="new" && (
            <button
              type="button"
              style={styles.deleteButton}
              onClick={handleDelete}
            >
              Eliminar ejercicio
            </button>
          )}

          <button style={styles.button} type="submit">
            {selectedId==="new"
              ? "Registrar ejercicio"
              : "Actualizar ejercicio"}
          </button>

        </div>

      </form>

    </div>
  );
}

const styles = {

container:{
  minHeight:"100vh",
  backgroundColor:"#0B0F1A",
  padding:"40px",
  display:"flex",
  flexDirection:"column",
  alignItems:"center"
},

title:{
  color:"#FF6B00",
  marginBottom:"30px"
},

form:{
  display:"flex",
  flexDirection:"column",
  width:"400px",
  gap:"12px",
  backgroundColor:"#1C1F2A",
  padding:"25px",
  borderRadius:"15px"
},

label:{
  color:"white",
  fontSize:"14px"
},

input:{
  padding:"10px",
  borderRadius:"8px",
  border:"none"
},

textarea:{
  padding:"10px",
  borderRadius:"8px",
  border:"none",
  height:"80px"
},

checkbox:{
  color:"white",
  fontSize:"14px"
},

previewContainer: {
  marginTop: "10px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start"
},

previewImage: {
  width: "200px",
  height: "auto",
  borderRadius: "10px",
  marginTop: "5px"
},

previewVideo: {
  width: "200px",
  height: "auto",
  borderRadius: "10px",
  marginTop: "5px"
},

buttons:{
  marginTop:"10px",
  display:"flex",
  justifyContent:"space-between",
  gap:"10px"
},

button:{
  flex:1,
  backgroundColor:"#FF6B00",
  color:"white",
  border:"none",
  padding:"12px",
  borderRadius:"10px",
  cursor:"pointer",
  fontSize:"16px"
},

deleteButton:{
  flex:1,
  backgroundColor:"#A00000",
  color:"white",
  border:"none",
  padding:"12px",
  borderRadius:"10px",
  cursor:"pointer",
  fontSize:"16px"
}

};