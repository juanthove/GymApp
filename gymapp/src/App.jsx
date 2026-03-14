import CreateUserScreen from "./screen/CreateUserScreen";
import CreateExerciseScreen from "./screen/CreateExerciseScreen";
import { BrowserRouter, Routes, Route } from "react-router-dom";


import HomeScreen from "./screen/HomeScreen";
import WorkoutScreen from "./screen/WorkoutScreen";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/workout" element={<WorkoutScreen />} />

        <Route path="/create-user" element={<CreateUserScreen />} />
        <Route path="/create-exercise" element={<CreateExerciseScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
