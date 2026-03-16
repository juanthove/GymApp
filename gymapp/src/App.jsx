import CreateUserScreen from "./screen/CreateUserScreen";
import CreateExerciseScreen from "./screen/CreateExerciseScreen";
import CreateWorkoutTemplateScreen from "./screen/CreateWorkoutTemplateScreen";
import CreateWorkoutScreen from "./screen/CreateWorkoutScreen";
import AdminScreen from "./screen/AdminScreen";
import { BrowserRouter, Routes, Route } from "react-router-dom";


import HomeScreen from "./screen/HomeScreen";
import WorkoutScreen from "./screen/WorkoutScreen";
import ExerciseScreen from "./screen/ExerciseScreen";
import FinalResumeScreen from "./screen/FinalResumeScreen";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/workout/:userId" element={<WorkoutScreen />} />
        <Route path="/exercise/:userId/:workoutDayId" element={<ExerciseScreen />} />
        <Route path="/final/:userId/:workoutDayId" element={<FinalResumeScreen />} />

        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/admin/users" element={<CreateUserScreen />} />
        <Route path="/admin/exercises" element={<CreateExerciseScreen />} />
        <Route path="/admin/workout-templates" element={<CreateWorkoutTemplateScreen />} />
        <Route path="/admin/workouts" element={<CreateWorkoutScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
