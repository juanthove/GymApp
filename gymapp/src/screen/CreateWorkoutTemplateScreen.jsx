import { useState, useEffect } from "react";

import { getExercises } from "../services/exerciseService";

import {
  createWorkoutTemplate,
  getWorkoutTemplates,
  getWorkoutTemplateById,
  updateWorkoutTemplate,
  deleteWorkoutTemplate
} from "../services/workoutTemplateService";

import FormPage from "../components/FormPage";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import PrimaryButton from "../components/PrimaryButton";
import DeleteButton from "../components/DeleteButton";

import "../styles/forms.css";

export default function CreateWorkoutTemplateScreen(){

  const [exercises,setExercises] = useState([]);
  const [templates,setTemplates] = useState([]);

  const [selectedTemplateId,setSelectedTemplateId] = useState("");

  const [name,setName] = useState("");
  const [description,setDescription] = useState("");
  const [days,setDays] = useState([]);

  const [message,setMessage] = useState("");

  useEffect(()=>{
    loadExercises();
    loadTemplates();
  },[]);

  const loadExercises = async ()=>{
    const data = await getExercises();
    setExercises(data);
  };

  const loadTemplates = async ()=>{
    const data = await getWorkoutTemplates();
    setTemplates(data);
  };

  const loadTemplateData = async (id)=>{

    if(!id){
      resetForm();
      return;
    }

    const template = await getWorkoutTemplateById(id);

    setName(template.name || "");
    setDescription(template.description || "");

    const loadedDays = template.days?.map(day=>({
      name:day.name,
      muscles:day.muscles,
      exercises:day.exercises.map((ex)=>({
        exerciseId:ex.exerciseId,
        exerciseName:ex.exerciseName,
        order:ex.order
      })),
      selectedExercise:""
    })) || [];

    setDays(loadedDays);
  };

  const resetForm = ()=>{
    setSelectedTemplateId("");
    setName("");
    setDescription("");
    setDays([]);
  };

  const addDay = ()=>{
    setDays([
      ...days,
      {
        name:`Día ${days.length+1}`,
        muscles:"",
        exercises:[],
        selectedExercise:""
      }
    ]);
  };

  const removeDay = (index)=>{
    const updated = [...days];
    updated.splice(index,1);
    setDays(updated);
  };

  const updateDayField = (index,field,value)=>{
    const updated = [...days];
    updated[index][field] = value;
    setDays(updated);
  };

  const addExerciseToDay = (dayIndex)=>{

    const selectedId = days[dayIndex].selectedExercise;
    if(!selectedId) return;

    const exercise = exercises.find(e=>e.id===Number(selectedId));

    const updated = [...days];

    updated[dayIndex].exercises.push({
      exerciseId:exercise.id,
      exerciseName:exercise.name,
      order:updated[dayIndex].exercises.length+1
    });

    updated[dayIndex].selectedExercise="";

    setDays(updated);
  };

  const removeExerciseFromDay = (dayIndex,exerciseIndex)=>{

    const updated = [...days];

    updated[dayIndex].exercises.splice(exerciseIndex,1);

    updated[dayIndex].exercises = updated[dayIndex].exercises.map((ex,i)=>({
      ...ex,
      order:i+1
    }));

    setDays(updated);
  };

  const handleSubmit = async (e)=>{
    e.preventDefault();

    try{

      const templateData = {
        name,
        description,
        days:days.map(day=>({
          name:day.name,
          muscles:day.muscles,
          exercises:day.exercises
        }))
      };

      if(selectedTemplateId){

        await updateWorkoutTemplate(selectedTemplateId,templateData);
        setMessage("Template actualizado");

      }else{

        await createWorkoutTemplate(templateData);
        setMessage("Template creado");

      }

      resetForm();
      loadTemplates();

    }catch(error){
      setMessage("Error: "+error.message);
    }
  };

  const handleDelete = async ()=>{

    if(!selectedTemplateId) return;

    if(!window.confirm("Eliminar este template?")) return;

    try{

      await deleteWorkoutTemplate(selectedTemplateId);

      setMessage("Template eliminado");

      resetForm();
      loadTemplates();

    }catch(error){
      setMessage("Error: "+error.message);
    }
  };

  return(

    <FormPage title="Workout Templates">

      <FormSelect
        label="Buscar template"
        value={selectedTemplateId}
        onChange={(e)=>{
          const id = e.target.value;
          setSelectedTemplateId(id);
          loadTemplateData(id);
        }}
      >

        <option value="">Nuevo template</option>

        {templates.map(t=>(
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}

      </FormSelect>

      <form className="form" onSubmit={handleSubmit}>

        <FormInput
          label="Nombre del template"
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

        <div style={{marginTop:"20px"}}>
          <PrimaryButton type="button" onClick={addDay}>
            Agregar día
          </PrimaryButton>
        </div>

        {days.map((day,dayIndex)=>(

          <div key={dayIndex} className="dayCard">

            <h3>Día {dayIndex+1}</h3>

            <FormInput
              label="Nombre del día"
              type="text"
              value={day.name}
              onChange={(e)=>updateDayField(dayIndex,"name",e.target.value)}
            />

            <FormInput
              label="Músculos trabajados"
              type="text"
              value={day.muscles}
              onChange={(e)=>updateDayField(dayIndex,"muscles",e.target.value)}
            />

            <FormSelect
              label="Agregar ejercicio"
              value={day.selectedExercise}
              onChange={(e)=>updateDayField(dayIndex,"selectedExercise",e.target.value)}
            >

              <option value="">Seleccionar ejercicio</option>

              {exercises.map(ex=>(
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}

            </FormSelect>

            <PrimaryButton
              type="button"
              onClick={()=>addExerciseToDay(dayIndex)}
            >
              Agregar ejercicio
            </PrimaryButton>

            <div style={{marginTop:"10px"}}>

              {day.exercises.map((ex,i)=>(

                <div key={i} className="exerciseRow">

                  <span>
                    {ex.order}. {ex.exerciseName}
                  </span>

                  <DeleteButton
                    type="button"
                    onClick={()=>removeExerciseFromDay(dayIndex,i)}
                  >
                    X
                  </DeleteButton>

                </div>

              ))}

            </div>

            <div style={{marginTop:"10px"}}>

              <DeleteButton
                type="button"
                onClick={()=>removeDay(dayIndex)}
              >
                Eliminar día
              </DeleteButton>

            </div>

          </div>

        ))}

        <div className="buttonContainer">

          {selectedTemplateId && (
            <DeleteButton
              type="button"
              onClick={handleDelete}
            >
              Eliminar Template
            </DeleteButton>
          )}

          <PrimaryButton type="submit">
            {selectedTemplateId ? "Actualizar Template" : "Guardar Template"}
          </PrimaryButton>

        </div>

      </form>

      {message && <div className="message">{message}</div>}

    </FormPage>
  );
}
