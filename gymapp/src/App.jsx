import CreateUserScreen from "./screen/CreateUserScreen";
import CreateSystemUserScreen from "./screen/CreateSystemUserScreen";
import CreateExerciseScreen from "./screen/CreateExerciseScreen";
import CreateWorkoutTemplateScreen from "./screen/CreateWorkoutTemplateScreen";
import CreateWorkoutScreen from "./screen/CreateWorkoutScreen";
import CreatePhraseScreen from "./screen/CreatePhraseScreen";
import CreateExerciseReminderRule from "./screen/CreateExerciseReminderRuleScreen";
import CreateUserLevelScreen from "./screen/CreateUserLevelScreen";
import CreateAchievementScreen from "./screen/CreateAchievementScreen";
import AdminScreen from "./screen/AdminScreen";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GlobalStyles } from "@mui/material";
import { useEffect } from "react";
import ScrollToTop from "./components/ScrollToTop";

import HomeScreen from "./screen/HomeScreen";
import WorkoutScreen from "./screen/WorkoutScreen";
import ExerciseScreen from "./screen/ExerciseScreen";
import FinalResumeScreen from "./screen/FinalResumeScreen";
import StatsScreen from "./screen/StatsScreen";
import AchievementsScreen from "./screen/AchievementsScreen";

import LoginScreen from "./screen/LoginScreen";

function AdminRoute({ children }) {
  if (typeof window === "undefined") {
    return children;
  }

  const raw = localStorage.getItem("systemUser");
  if (!raw) {
    return <Navigate to="/login" replace />;
  }

  try {
    const currentUser = JSON.parse(raw);
    if (currentUser?.role !== "ADMIN") {
      return <Navigate to="/home" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (e.target.tagName === "IMG") {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);
  return (
    <>
      <GlobalStyles
        styles={{
          "html, body, #root": {
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            WebkitTapHighlightColor: "transparent",
            overscrollBehavior: "none",
          },

          "input, textarea, [contenteditable='true']": {
            userSelect: "text",
            WebkitUserSelect: "text",
            WebkitTouchCallout: "default",
          },

          img: {
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            WebkitUserDrag: "none",
            userDrag: "none",
          },
        }}
      />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/workout/:userId" element={<WorkoutScreen />} />
          <Route path="/exercise/:userId/:workoutDayId" element={<ExerciseScreen />} />
          <Route path="/final/:userId/:workoutDayId" element={<FinalResumeScreen />} />
          <Route path="/stats/:userId" element={<StatsScreen />} />
          <Route path="/achievements/:userId" element={<AchievementsScreen />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminScreen />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <CreateUserScreen />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/system-users"
            element={
              <AdminRoute>
                <CreateSystemUserScreen />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/exercises"
            element={
              <AdminRoute>
                <CreateExerciseScreen />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/workout-templates"
            element={
              <AdminRoute>
                <CreateWorkoutTemplateScreen />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/workouts"
            element={
              <AdminRoute>
                <CreateWorkoutScreen />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/phrases"
            element={
              <AdminRoute>
                <CreatePhraseScreen />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/rules"
            element={
              <AdminRoute>
                <CreateExerciseReminderRule />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/user-level"
            element={
              <AdminRoute>
                <CreateUserLevelScreen />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/achievements"
            element={
              <AdminRoute>
                <CreateAchievementScreen />
              </AdminRoute>
            }
          />

          <Route path="/login" element={<LoginScreen />} />
          <Route path="/" element={<LoginScreen />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
