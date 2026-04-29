import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getUserById } from "../services/userService";

import backgroundImg from "../assets/gymproIcon.png";

import {
  getWorkoutDaySummary
} from "../services/workoutDayService";

import {
  Container,
  Typography,
  Stack,
  Button,
  Box
} from "@mui/material";

import { keyframes } from "@mui/system";


import VolumeCard from "../components/VolumeCard";
import PrimaryButton from "../components/PrimaryButton";
import MuscleVolumeCard from "../components/MuscleVolumeCard";
import StatCard from "../components/StatCard";

export default function FinalResumeScreen() {

  const { userId, workoutDayId } = useParams();

  const [user, setUser] = useState(null);
  const [totalVolume, setTotalVolume] = useState(0);
  const [muscleVolume, setMuscleVolume] = useState([]);
  const [duration, setDuration] = useState(0);
  const [totalExercises, setTotalExercises] = useState(0);

  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {
    const u = await getUserById(userId);
    setUser(u);

    const summary = await getWorkoutDaySummary(userId, workoutDayId);

    setTotalVolume(summary.totalVolume ?? 0);
    setMuscleVolume(summary.muscleVolumes ?? []);
    setDuration(summary.durationMinutes ?? 0);
    setTotalExercises(summary.totalExercises ?? 0);
  };

  // 🎬 ENTRADA (fade + scale)
  const fadeScale = keyframes`
    0% {
      opacity: 0;
      transform: scale(0.85);
    }
    60% {
      opacity: 1;
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  `;

  // ✨ GLOW SUAVE (energía)
  const glow = keyframes`
    0% {
      text-shadow: 0 0 4px rgba(255,255,255,0.2), 0 0 10px rgba(211,47,47,0.2);
    }
    100% {
      text-shadow: 0 0 8px rgba(255,255,255,0.4), 0 0 18px rgba(211,47,47,0.7);
    }
  `;

  const bounceIdle = keyframes`
    0%, 80%, 100% {
      transform: translateY(0);
    }
    85% {
      transform: translateY(-8px);
    }
    90% {
      transform: translateY(0);
    }
    95% {
      transform: translateY(-4px);
    }
  `;

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
  };

  if (!user) return null;

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        overflow: "hidden"
      }}
    >


      {/* 🖼️ IMAGEN DE FONDO (parte inferior) */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          zIndex: 0
        }}
      />

      {/* SOMBREADO OSCURO */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(44, 44, 44, 0.4)",
          backdropFilter: "blur(6px)",
          zIndex: 1
        }}
      />

      {/* TRIANGULO ROJO */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "50vh",
          background: `linear-gradient(135deg, #e02020 0%, #f13838 25%, #f55182 80%)`,
          clipPath: "polygon(0 0, 100% 0, 100% 40%, 50% 50%, 0 40%)",
          zIndex: 2
        }}
      />

      {/* 📦 CONTENIDO */}
      <Container
        maxWidth="md"
        sx={{
          position: "relative",
          zIndex: 3,
          mt: 6
        }}
      >
        <Stack spacing={5} textAlign="center" alignItems="center" sx={{ pb: 15 }}>

          {/* 🟢 MENSAJE */}
          <Box sx={{ textAlign: "center", display: "inline-block" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "#fff",
                textShadow: "0 4px 12px rgba(0,0,0,0.35)"
              }}
            >
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  mr: 1,
                  animation: `${bounceIdle} 2.5s ease-in-out infinite`
                }}
              >
                🎉
              </Box>
              Felicitaciones{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 900,
                background: "linear-gradient(90deg, #ffd54f, #ffd36c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                animation: `
                  ${fadeScale} 0.6s ease-out,
                  ${glow} 2s ease-in-out 0.6s infinite alternate
                `
              }}
            >
              {user.name}
            </Box>
            </Typography>

            <Box
              sx={{
                height: "1px",
                width: "90%",
                mx: "auto",
                backgroundColor: "#ddd",
                mb: 2,
                mt: 3,
              }}
            />
          </Box>


          {/* 🔵 VOLUMEN TOTAL */}
          {muscleVolume.length === 0 ? (
            <Box></Box>
          ) : (
            <VolumeCard value={totalVolume} />
          )}
          

          {/* Estadisticas */}
          <Stack
            direction="row"
            spacing={2}
            width="100%"
            maxWidth={520}
          >
            <StatCard
              label="Duración"
              value={formatDuration(duration)}
            />
            {muscleVolume.length === 0 ? (
              <Box></Box>
            ) : (
              <StatCard
                label="Ejercicios completados"
                value={totalExercises} // 🔥 mock por ahora
              />
            )}
          </Stack>

          {/* 🟣 VOLUMEN POR MÚSCULO */}
          {muscleVolume.length === 0 ? (
            <>
              <Box sx={{ height: 60 }} />
              <Box
                sx={{
                  mt: 8,
                  px: 2,
                  py: 4,
                  borderRadius: 4,
                  background: "rgba(0,0,0,0.25)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
                  display: "inline-block"
                }}
              >
                <Typography
                  sx={{
                    fontSize: "2.5rem", // 🔥 bien grande
                    fontWeight: 800,
                    color: "#fff",
                    textAlign: "center",
                    textShadow: "0 6px 18px rgba(0,0,0,0.6)",
                    lineHeight: 1.3
                  }}
                >
                  Registrá tus series para ver tus estadísticas
                </Typography>
              </Box>
            </>
          ) : (
          
          <Box width="75%">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                my: 2
              }}
            >
              <Box sx={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.8)" }} />

              <Typography
                sx={{
                  mx: 2,
                  fontWeight: 600,
                  fontSize: "1.8rem",
                  color: 'white',
                  whiteSpace: "nowrap"
                }}
              >
                Volumen por músculo
              </Typography>

              <Box sx={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.8)" }} />
            </Box>

            
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: "center" // 👈 clave para centrar la última
              }}
            >
              {muscleVolume.map((m) => (
                <Box
                  key={m.muscle}
                  sx={{
                    width: "calc(50% - 8px)", // 👈 2 por fila (gap compensado)
                    minWidth: "260px", // opcional para que no se achiquen demasiado
                  }}
                >
                  <MuscleVolumeCard
                    muscle={m.muscle}
                    volume={m.volume}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          )}

          {/* 🔙 BOTÓN */}
          <Box
            sx={{
              position: "fixed",
              bottom: 20,
              left: 0,
              right: 0,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              zIndex: 10,
              pb: 2
            }}
          >
            <PrimaryButton
              label="Volver"
              to={`/workout/${userId}`}
            />
          </Box>
        </Stack>

        
      </Container>
    </Box>
  );
}