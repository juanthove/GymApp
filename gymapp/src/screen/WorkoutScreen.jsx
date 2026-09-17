import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useRequireAuth from "../hooks/useRequireAuth";
import { useDarkMode } from "../context/DarkModeContext";

import backgroundImg from "../assets/gymproIcon.png";

import { getUserById, getCurrentWorkout, logoutUser, configRegisterSets } from "../services/userService";
import { getWorkoutById } from "../services/workoutService";
import {
  startWorkoutDay,
  cancelWorkoutDay,
  getWorkoutDayStatus,
  getWorkoutDayImageUrl,
} from "../services/workoutDayService";
import { getRandomPhrase } from "../services/phraseService";

import { Container, Typography, Stack, Box, Button, CircularProgress, Checkbox } from "@mui/material";

import SettingsIcon from "@mui/icons-material/Settings";

import { fontSize, keyframes } from "@mui/system";

import GymCard from "../components/GymCard";
import BackButton from "../components/BackButton";
import MuscleChips from "../components/MuscleChips";
import PrimaryButton from "../components/PrimaryButton";
import AnimatedDialog from "../components/AnimatedDialog";
import InfoTooltip from "../components/InfoTooltip";

export default function WorkoutScreen() {
  useRequireAuth();
  const { userId } = useParams();
  const navigate = useNavigate();

  const { darkMode } = useDarkMode();
  const [user, setUser] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [phrase, setPhrase] = useState("");
  const hasLoadedPhrase = useRef(false);
  const [dayStatus, setDayStatus] = useState({});
  const [hasWorkout, setHasWorkout] = useState(true);

  const [animatedProgress, setAnimatedProgress] = useState(0);

  const holdTimer = useRef(null);
  const longPressTriggered = useRef(false);
  const startPoint = useRef({ x: 0, y: 0 });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [registerSets, setRegisterSets] = useState(false);
  const [showRegisterSetsWarning, setShowRegisterSetsWarning] = useState(false);

  const [registerSetsWarningOpen, setRegisterSetsWarningOpen] = useState(false);
  const [warningTooltipPosition, setWarningTooltipPosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const u = await getUserById(userId);
    setUser(u);
    setRegisterSets(u.registerSets || false);

    let current = null;

    try {
      current = await getCurrentWorkout(userId);
      setHasWorkout(!!current);
    } catch {
      setHasWorkout(false);
    }

    if (current) {
      const w = await getWorkoutById(current.id);

      const statuses = {};

      for (const day of w.days) {
        const status = await getWorkoutDayStatus(day.id);
        statuses[day.id] = status;
      }

      setDayStatus(statuses);
      setWorkout(w);
    }
  };

  useEffect(() => {
    if (hasLoadedPhrase.current) return;
    hasLoadedPhrase.current = true;

    const loadPhrase = async () => {
      try {
        const phraseData = await getRandomPhrase();
        setPhrase(phraseData.text);
      } catch {
        setPhrase("Hoy es un buen día para mejorar");
      }
    };

    loadPhrase();
  }, []);

  //Cuando se presiona un dia
  const handleDayClick = (day) => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }

    if (dayStatus[day.id] === "IN_PROGRESS") {
      navigate(`/exercise/${userId}/${day.id}`);
      return;
    }

    setSelectedDay(day);
  };

  //Cuando se mantiene presionado un dia
  const handleDayPressStart = (e, day) => {
    longPressTriggered.current = false;

    startPoint.current = {
      x: e.clientX,
      y: e.clientY,
    };

    holdTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setSelectedDay(day);
    }, 500);
  };

  const handleDayMove = (e) => {
    const dx = Math.abs(e.pageX - startPoint.current.x);
    const dy = Math.abs(e.pageY - startPoint.current.y);

    if (dx > 10 || dy > 10) {
      clearTimeout(holdTimer.current);
    }
  };

  const handleDayPressEnd = () => {
    clearTimeout(holdTimer.current);
  };

  const handleStartWorkout = async () => {
    if (!selectedDay) return;

    try {
      const currentStatus = dayStatus[selectedDay.id];

      if (currentStatus === "NOT_STARTED") {
        await startWorkoutDay(selectedDay.id);
      }

      const newStatus = await getWorkoutDayStatus(selectedDay.id);

      setDayStatus((prev) => ({
        ...prev,
        [selectedDay.id]: newStatus,
      }));

      navigate(`/exercise/${userId}/${selectedDay.id}`);
    } catch (e) {
      alert("Error al iniciar el entrenamiento");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const [year, month, day] = date.split("-");
    return new Date(year, month - 1, day).toLocaleDateString("es-UY");
  };

  const hasDayInProgress = () => {
    return Object.values(dayStatus).some((status) => status === "IN_PROGRESS");
  };

  const handleLogout = () => {
    if (hasDayInProgress()) {
      alert("No podés cerrar sesión mientras hay un entrenamiento en curso");
      return;
    }

    logoutUser(userId);

    navigate("/home");
  };

  const sortedDays = workout?.days
    ? [...workout.days].sort((a, b) => {
        const order = {
          IN_PROGRESS: 0,
          NOT_STARTED: 1,
          COMPLETED: 2,
        };

        const statusA = dayStatus[a.id] || "NOT_STARTED";
        const statusB = dayStatus[b.id] || "NOT_STARTED";

        if (order[statusA] !== order[statusB]) {
          return order[statusA] - order[statusB];
        }

        return a.dayOrder - b.dayOrder;
      })
    : [];

  const glow = keyframes`
  0% {
    text-shadow:
      0 0 6px rgba(255, 235, 59, 0.4),
      0 0 12px rgba(255, 193, 7, 0.3),
      0 2px 6px rgba(0,0,0,0.7);
  }
  100% {
    text-shadow:
      0 0 14px rgba(255, 235, 59, 0.8),
      0 0 28px rgba(255, 193, 7, 0.6),
      0 3px 12px rgba(0,0,0,0.9);
  }
`;

  const shine = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

  const totalDays = workout?.days?.length || 0;

  const completedDays = Object.values(dayStatus).filter((status) => status === "COMPLETED").length;

  const progress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

  useEffect(() => {
    let start = null;
    const duration = 1200;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progressTime = timestamp - start;

      const progressPercent = Math.min(progressTime / duration, 1);

      setAnimatedProgress(progress * progressPercent);

      if (progressPercent < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [progress]);

  const isComplete = completedDays === totalDays;

  const status = dayStatus[selectedDay?.id];

  const handleCancelWorkoutDay = async () => {
    if (!selectedDay) return;

    try {
      await cancelWorkoutDay(selectedDay.id);

      const newStatus = await getWorkoutDayStatus(selectedDay.id);

      setDayStatus((prev) => ({
        ...prev,
        [selectedDay.id]: newStatus,
      }));

      setSelectedDay(null);
    } catch (e) {
      alert("Error al cancelar el entrenamiento");
    }
  };

  const openSettings = () => {
    setRegisterSets(user.registerSets || false);
    setShowRegisterSetsWarning(false);
    setSettingsOpen(true);
  };

  const handleSaveSettings = async () => {
    if (user.registerSets !== registerSets) {
      await registerSet(registerSets);
    }

    setSettingsOpen(false);
  };

  const handleRegisterSetChange = (event) => {
    const value = event.target.checked;

    setRegisterSets(value);

    if (!value && hasDayInProgress() && user.registerSets) {
      setShowRegisterSetsWarning(true);
    } else {
      setShowRegisterSetsWarning(false);
    }
  };

  const registerSet = async (value) => {
    try {
      const updatedUser = await configRegisterSets(userId, value);
      setUser(updatedUser);
    } catch (error) {
      console.error("Error al configurar el registro de series:", error);
    }
  };

  const handleRegisterSetsWarningClick = (event) => {
    const { clientX, clientY } = event;

    setWarningTooltipPosition({
      x: clientX,
      y: clientY,
    });

    setRegisterSetsWarningOpen((prev) => !prev);
  };

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#2c2c2c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="white">Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
      }}
      onPointerDown={() => {
        if (registerSetsWarningOpen) {
          setRegisterSetsWarningOpen(false);
        }
      }}
    >
      {/* BACKGROUND */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          zIndex: 0,
        }}
      />

      {/* OVERLAY */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: darkMode ? "rgba(15, 23, 42, 0.78)" : "rgba(44, 44, 44, 0.4)",
          backdropFilter: "blur(6px)",
          zIndex: 1,
        }}
      />

      {/* CONTENIDO */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          mt: 6,
        }}
      >
        <Box sx={{ position: "relative", mb: 2 }}>
          {/* TOP BAR */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",

              px: 2,
              py: 1.2,

              mb: 3,
              borderRadius: 3,
              backdropFilter: "blur(10px)",
              background: darkMode ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.15)",
              border: darkMode ? "1px solid rgba(148,163,184,0.24)" : "1px solid rgba(255,255,255,0.25)",
              boxShadow: darkMode ? "0 4px 12px rgba(2,6,23,0.45)" : "0 4px 12px rgba(0,0,0,0.2)",

              width: {
                xs: "90%",
                md: "100%",
              },
              maxWidth: "800px",
              mx: "auto",
            }}
          >
            <BackButton to="/home" sx={{ ml: { xs: 4, md: 8 } }} />

            {/*Boton Ajustes*/}
            <Button onClick={openSettings} sx={{ color: darkMode ? "#f8fafc" : "white", py: 0.5 }}>
              <SettingsIcon sx={{ fontSize: "3rem" }} />
            </Button>
          </Box>

          {/* TITULO */}
          <Typography
            variant="h3"
            textAlign="center"
            sx={{
              mt: 3,
              fontWeight: 900,
              color: "#fff",

              textShadow: "0 4px 20px rgba(0,0,0,0.6)",

              letterSpacing: "0.5px",
            }}
          >
            Hola {user.name}
          </Typography>
        </Box>

        <Container
          maxWidth="sm"
          sx={{
            position: "relative",
            zIndex: 2,
            mt: 6,
          }}
        >
          <Stack spacing={4} sx={{ mb: 5 }}>
            {workout && (
              <Box
                sx={{
                  textAlign: "center",
                  mt: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    color: "#fff",
                    textShadow: "0 4px 15px rgba(0,0,0,0.6)",
                    mt: 0.5,
                  }}
                >
                  {formatDate(workout.startDate)} - {formatDate(workout.endDate)}
                </Typography>
              </Box>
            )}

            <Box sx={{ position: "relative", display: "inline-block" }}>
              {/* BASE (SIEMPRE visible) */}
              <Typography
                textAlign="center"
                sx={{
                  fontStyle: "italic",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  color: "#ffeb3b",
                  animation: `${glow} 3s ease-in-out infinite alternate`,
                }}
              >
                {phrase}
              </Typography>

              {/* SHINE REAL */}
              <Typography
                textAlign="center"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",

                  fontStyle: "italic",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.5px",

                  background: "linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.9) 50%, transparent 60%)",
                  backgroundSize: "200% auto",

                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",

                  animation: `${shine} 8s linear infinite`,
                  pointerEvents: "none",
                }}
              >
                {phrase}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: 2,
                mb: 1,
              }}
            >
              <Box sx={{ position: "relative", display: "inline-flex", bodrderRadius: "50%", overflow: "hidden" }}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 180,
                    height: 180,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0, 0, 0, 0.7) 0%, transparent 70%)",
                    zIndex: 0,
                  }}
                />

                <Box sx={{ position: "relative", zIndex: 1, borderRadius: "50%", overflow: "hidden" }}>
                  {/* SVG GRADIENT */}
                  <svg width={0} height={0}>
                    <defs>
                      <linearGradient id="gradientProgress" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ff4343" /> {/* amarillo claro */}
                        <stop offset="50%" stopColor="#ff1f1f" /> {/* amarillo */}
                        <stop offset="100%" stopColor="#ff0000" /> {/* dorado */}
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Fondo */}
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={180}
                    thickness={4}
                    sx={{
                      color: "rgba(255,255,255,0.15)",
                    }}
                  />

                  {/* Progreso con gradiente */}
                  <CircularProgress
                    variant="determinate"
                    value={animatedProgress}
                    size={180}
                    thickness={4}
                    sx={{
                      position: "absolute",
                      left: 0,
                      color: "url(#gradientProgress)",
                      transform: isComplete ? "scale(1.05)" : "scale(1)",
                      transition: "transform 0.4s ease",

                      "& .MuiCircularProgress-circle": {
                        stroke: "url(#gradientProgress)",
                        strokeLinecap: "round",
                        filter: "drop-shadow(0 0 8px rgba(255, 59, 59, 0.6))",
                      },
                    }}
                  />

                  {/* Texto centro */}
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: "absolute",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: "1.6rem",
                        color: "#fff",
                        textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                      }}
                    >
                      {completedDays}/{totalDays}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "1.2rem",
                        color: "rgba(255,255,255,0.8)",
                        textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                        textAlign: "center",
                        lineHeight: 1.1,
                      }}
                    >
                      días <br /> completados
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {!hasWorkout && (
              <Typography textAlign="center" color="white">
                Este usuario no tiene planilla asignada actualmente.
              </Typography>
            )}

            {workout &&
              sortedDays.map((day) => {
                const status = dayStatus[day.id];

                return (
                  <GymCard
                    key={day.id}
                    title={day.name}
                    subtitle={<MuscleChips muscles={day.muscles} chipSx={{ fontWeight: 600, fontSize: "1.05rem" }} />}
                    onClick={() => handleDayClick(day)}
                    onPointerDown={(e) => handleDayPressStart(e, day)}
                    onPointerMove={handleDayMove}
                    onPointerUp={handleDayPressEnd}
                    onPointerLeave={handleDayPressEnd}
                    onPointerCancel={handleDayPressEnd}
                    status={status}
                    showArrow={true}
                  />
                );
              })}

            <PrimaryButton label="📊 Estadísticas" to={`/stats/${userId}`} sx={{ fontSize: "1.2rem" }} />

            <PrimaryButton label="🏆 Logros" to={`/achievements/${userId}`} sx={{ fontSize: "1.2rem" }} />

            <PrimaryButton
              label="Cerrar sesión"
              onClick={handleLogout}
              disabled={hasDayInProgress()}
              sx={{
                fontSize: "1.5rem",
                py: 0.7,
                background: "linear-gradient(145deg, #ff6b6b, #c62828)",
                opacity: 0.9,
              }}
            />
          </Stack>

          <AnimatedDialog
            open={!!selectedDay}
            onClose={() => setSelectedDay(null)}
            title="Músculos que vas a trabajar hoy"
            titleSize="1.7rem"
            headerSx={{ py: 1.5 }}
            paperSx={{
              backgroundColor: darkMode ? "#0f172a" : "#fff",
              color: darkMode ? "#f8fafc" : "#111827",
            }}
            closeSx={{
              color: darkMode ? "#f8fafc" : "#666",
              "&:hover": {
                backgroundColor: "transparent",
                color: darkMode ? "#fff" : "#000",
              },
            }}
            actions={
              <>
                {status === "IN_PROGRESS" && (
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={handleCancelWorkoutDay}
                    sx={{
                      flex: 1,
                      fontSize: {
                        xs: "1rem",
                        md: "1.1rem",
                      },
                      px: 1.5,
                      py: 1,
                    }}
                  >
                    Cancelar día
                  </Button>
                )}

                <Button
                  variant="contained"
                  onClick={handleStartWorkout}
                  disabled={status === "COMPLETED"}
                  sx={{
                    flex: 2,
                    fontSize: {
                      xs: "1rem",
                      md: "1.1rem",
                    },
                    px: 1.5,
                    py: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {status === "COMPLETED"
                    ? "Entrenamiento completado"
                    : status === "IN_PROGRESS"
                      ? "Continuar entrenamiento"
                      : "Comenzar entrenamiento"}
                </Button>
              </>
            }
          >
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={2}>
              <MuscleChips
                muscles={selectedDay?.muscles}
                chipSx={{
                  fontWeight: 600,
                  fontSize: "1.4rem",
                  height: 30,
                }}
              />

              {selectedDay?.muscleImage && (
                <img
                  src={
                    selectedDay?.muscleImage ? getWorkoutDayImageUrl(selectedDay.muscleImage) : "/body-placeholder.png"
                  }
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                  }}
                />
              )}
            </Box>
          </AnimatedDialog>

          {/*SETTINGS*/}
          <AnimatedDialog
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            title="Configuración"
            titleSize="1.7rem"
            headerSx={{
              py: 1.5,
            }}
            paperSx={{
              minHeight: 360,
              backgroundColor: darkMode ? "#0f172a" : "#fff",
              color: darkMode ? "#f8fafc" : "#111827",
            }}
            actions={
              <PrimaryButton
                label="Guardar configuración"
                onClick={handleSaveSettings}
                sx={{
                  width: "100%",
                  fontSize: "1.1rem",
                  py: 1,
                }}
              />
            }
          >
            <Box
              sx={{
                p: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  px: 2,
                  py: 1.5,
                  borderRadius: 2.5,
                  background: registerSets ? "rgba(236, 30, 23, 0.41)" : "rgba(255,255,255,0.08)",
                  border: registerSets ? "1px solid rgba(255, 45, 45, 0.77)" : "1px solid rgba(30, 30, 30, 0.29)",
                  boxShadow: registerSets ? "0 4px 12px rgba(226, 38, 38, 0.51)" : "0 4px 12px rgba(0,0,0,0.2)",
                  transition: "all 0.2s ease",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      color: darkMode ? "#f8fafc" : "#000",
                    }}
                  >
                    Registrar series
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "1rem",
                      color: darkMode ? "#cbd5e1" : "#000",
                      mt: 0.3,
                    }}
                  >
                    Guardar las series realizadas durante el entrenamiento
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    checked={registerSets}
                    onChange={handleRegisterSetChange}
                    sx={{
                      color: "rgba(0,0,0,0.5)",
                      mr: 1.5,
                      pr: 0.2,
                      pl: 0,

                      "&.Mui-checked": {
                        color: "#ec0c0c",
                      },

                      "& .MuiSvgIcon-root": {
                        fontSize: "2.2rem",
                      },
                    }}
                  />
                  {showRegisterSetsWarning && (
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegisterSetsWarningClick(e);
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                      }}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        backgroundColor: "#d32f2f",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: "1rem",
                        mr: 1,
                      }}
                    >
                      !
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </AnimatedDialog>
          <InfoTooltip
            open={registerSetsWarningOpen}
            text="Al desactivar el registro, se eliminarán las series guardadas del día en curso."
            position={warningTooltipPosition}
            maxWidth={300}
            sx={{ width: "min(200px, 70vw)" }}
          />
        </Container>
      </Box>
    </Box>
  );
}
