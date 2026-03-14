import React, { useEffect, useState } from "react";
import { getCurrentWorkout } from "../services/userService";
import { getWorkoutDays } from "../services/workoutDayService";
import { useParams, useNavigate } from "react-router-dom";

export default function WorkoutScreen() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState(null);
  const [days, setDays] = useState([]);

  useEffect(() => {
    loadWorkout();
  }, []);

  const loadWorkout = async () => {
    try {
      const workoutData = await getCurrentWorkout(userId);
      setWorkout(workoutData);

      const daysData = await getWorkoutDays(workoutData.id);
      setDays(daysData);
    } catch (error) {
      console.error("Error cargando workout:", error);
    }
  };

  const goToDay = (dayId) => {
    navigate(`/day/${dayId}`);
  };

  if (!workout) return <div>Cargando...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{workout.name}</h1>

      <div style={styles.dates}>
        <p>Inicio: {workout.startDate}</p>
        <p>Fin: {workout.endDate ?? "Activo"}</p>
      </div>

      <div style={styles.cardsContainer}>
        {days.map((day) => (
          <div
            key={day.id}
            style={styles.card}
            onClick={() => goToDay(day.id)}
          >
            <h2 style={styles.dayName}>{day.name}</h2>

            <p style={styles.muscles}>
              {day.muscles}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0B0F1A",
    padding: "40px",
  },

  title: {
    color: "#FF6B00",
    fontSize: "32px",
    marginBottom: "10px",
  },

  dates: {
    color: "white",
    marginBottom: "30px",
  },

  cardsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
  },

  card: {
    width: "220px",
    height: "130px",
    backgroundColor: "#1C1F2A",
    borderRadius: "20px",
    padding: "20px",
    cursor: "pointer",
    boxShadow: "0px 5px 15px rgba(0,0,0,0.4)",
  },

  dayName: {
    color: "#FF6B00",
    marginBottom: "10px",
  },

  muscles: {
    color: "white",
  },
};