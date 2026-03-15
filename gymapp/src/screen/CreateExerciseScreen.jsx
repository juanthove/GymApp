import { useEffect, useState } from "react";

import {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  getExerciseImageUrl,
  getExerciseVideoUrl
} from "../services/exerciseService";

import FormPage from "../components/FormPage";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import PrimaryButton from "../components/PrimaryButton";
import DeleteButton from "../components/DeleteButton";

import "../styles/forms.css";

export default function CreateExerciseScreen(){

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

  const loadExercises = async ()=>{
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
    setFileKey(prev=>prev+2);

    loadExercises();
  };

  const handleDelete = async ()=>{

    if(!window.confirm("Eliminar ejercicio?")) return;

    await deleteExercise(selectedId);

    setSelectedId("new");
    setName("");
    setDescription("");
    setCurrentExercise(null);

    loadExercises();
  };

  return (

    <FormPage title="Ejercicios">

      <form className="form" onSubmit={handleSubmit}>

        <FormSelect
          label="Seleccionar ejercicio"
          value={selectedId}
          onChange={(e)=>handleSelect(e.target.value)}
        >

          <option value="new">Nuevo ejercicio</option>

          {exercises.map(ex=>(
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}

        </FormSelect>

        <FormInput
          label="Nombre"
          type="text"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          required
        />

        <label className="label">Descripción</label>

        <textarea
          className="textarea"
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
        />

        <label className="label">Imagen</label>

        <input
          key={fileKey}
          type="file"
          accept="image/*"
          onChange={(e)=>setImage(e.target.files[0])}
        />

        {currentExercise?.image && selectedId!=="new" &&

          <label className="checkbox">
            <input
              type="checkbox"
              checked={deleteImage}
              onChange={()=>setDeleteImage(!deleteImage)}
            />
            Eliminar imagen
          </label>
        }

        {currentExercise?.image && !deleteImage &&

          <img
            src={getExerciseImageUrl(currentExercise.image)}
            className="previewImage"
          />
        }

        <label className="label">Video</label>

        <input
          key={fileKey+1}
          type="file"
          accept="video/*"
          onChange={(e)=>setVideo(e.target.files[0])}
        />

        {currentExercise?.video && selectedId!=="new" &&

          <label className="checkbox">
            <input
              type="checkbox"
              checked={deleteVideo}
              onChange={()=>setDeleteVideo(!deleteVideo)}
            />
            Eliminar video
          </label>
        }

        {currentExercise?.video && !deleteVideo &&

          <video
            src={getExerciseVideoUrl(currentExercise.video)}
            controls
            className="previewVideo"
          />
        }

        <div className="buttonContainer">

          {selectedId!=="new" &&
            <DeleteButton type="button" onClick={handleDelete}>
              Eliminar ejercicio
            </DeleteButton>
          }

          <PrimaryButton type="submit">
            {selectedId==="new"
              ? "Registrar ejercicio"
              : "Actualizar ejercicio"}
          </PrimaryButton>

        </div>

      </form>

    </FormPage>
  );
}
