import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GlobalStyles, Box } from "@mui/material";
import { Suspense, lazy, useEffect, useState } from "react";
import ScrollToTop from "./components/ScrollToTop";
import DarkModeContext from "./context/DarkModeContext";

const CreateUserScreen = lazy(() => import("./screen/CreateUserScreen"));
const CreateSystemUserScreen = lazy(() => import("./screen/CreateSystemUserScreen"));
const CreateExerciseScreen = lazy(() => import("./screen/CreateExerciseScreen"));
const CreateWorkoutTemplateScreen = lazy(() => import("./screen/CreateWorkoutTemplateScreen"));
const CreateWorkoutScreen = lazy(() => import("./screen/CreateWorkoutScreen"));
const CreatePhraseScreen = lazy(() => import("./screen/CreatePhraseScreen"));
const CreateExerciseReminderRule = lazy(() => import("./screen/CreateExerciseReminderRuleScreen"));
const CreateUserLevelScreen = lazy(() => import("./screen/CreateUserLevelScreen"));
const CreateAchievementScreen = lazy(() => import("./screen/CreateAchievementScreen"));
const AdminScreen = lazy(() => import("./screen/AdminScreen"));

const HomeScreen = lazy(() => import("./screen/HomeScreen"));
const WorkoutScreen = lazy(() => import("./screen/WorkoutScreen"));
const ExerciseScreen = lazy(() => import("./screen/ExerciseScreen"));
const FinalResumeScreen = lazy(() => import("./screen/FinalResumeScreen"));
const StatsScreen = lazy(() => import("./screen/StatsScreen"));
const AchievementsScreen = lazy(() => import("./screen/AchievementsScreen"));
const LoginScreen = lazy(() => import("./screen/LoginScreen"));

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
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem("gymapp-dark-mode") === "true";
  });

  useEffect(() => {
    const handleContextMenu = (e) => {
      //if (e.target.tagName === "IMG") {
      e.preventDefault();
      //}
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gymapp-dark-mode", String(darkMode));
    }

    document.body.style.backgroundColor = darkMode ? "#0f172a" : "#f5f5f5";
    document.body.style.color = darkMode ? "#f8fafc" : "#111827";
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
  }, [darkMode]);

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      <GlobalStyles
        styles={{
          "html, body, #root": {
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            WebkitTapHighlightColor: "transparent",
            overscrollBehavior: "none",
            backgroundColor: darkMode ? "#0f172a" : "#f5f5f5",
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
        <Suspense
          fallback={
            <Box
              sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: darkMode ? "#0f172a" : "#f5f5f5",
                color: darkMode ? "#fff" : "#111827",
                fontSize: "1.1rem",
                fontWeight: 600,
              }}
            >
              Cargando...
            </Box>
          }
        >
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
        </Suspense>
      </BrowserRouter>
    </DarkModeContext.Provider>
  );
}

export default App;
