import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

export default function AdminScreen(){

  const navigate = useNavigate();

  return(

    <div className="adminContainer">

      <h1 className="adminTitle">Panel de Administración</h1>

      <div className="adminGrid">

        <div
          className="adminCard"
          onClick={()=>navigate("/admin/users")}
        >
          <h2>👤 Usuarios</h2>
          <p>Crear y administrar usuarios</p>
        </div>

        <div
          className="adminCard"
          onClick={()=>navigate("/admin/exercises")}
        >
          <h2>💪 Ejercicios</h2>
          <p>Crear ejercicios</p>
        </div>

        <div
          className="adminCard"
          onClick={()=>navigate("/admin/workout-templates")}
        >
          <h2>📋 Workout Templates</h2>
          <p>Crear templates de entrenamiento</p>
        </div>

        <div
          className="adminCard"
          onClick={()=>navigate("/admin/workouts")}
        >
          <h2>📋 Crear Planilla</h2>
          <p>Crear planillas de entrenamiento</p>
        </div>

      </div>

    </div>
  );
}