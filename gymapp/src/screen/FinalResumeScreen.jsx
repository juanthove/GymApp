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

export default function FinalResumeScreen() {

  const { userId, workoutDayId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [totalVolume, setTotalVolume] = useState(0);
  const [muscleVolume, setMuscleVolume] = useState([]);
  const [duration, setDuration] = useState(0);

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
      text-shadow: 0 0 6px rgba(255,255,255,0.2), 0 0 10px rgba(211,47,47,0.2);
    }
    100% {
      text-shadow: 0 0 10px rgba(255,255,255,0.4), 0 0 18px rgba(211,47,47,0.7);
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
        <Stack spacing={4} textAlign="center" alignItems="center">

          {/* 🟢 MENSAJE */}
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
              width: "75%",
              backgroundColor: "#ddd",
              mb: 2
            }}
          />

          <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: "1.7rem" }}>
            Finalizaste la rutina en{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 800,
                color: "#ffffff", // mismo color pero sin gradient
                textShadow: "0 2px 6px rgba(0,0,0,0.3)"
              }}
            >
              {formatDuration(duration)}
            </Box>
          
          </Typography>


          {/* 🔵 VOLUMEN TOTAL */}
          <VolumeCard value={totalVolume} />

          {/* 🟣 VOLUMEN POR MÚSCULO */}
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

            <Stack spacing={1}>
              <Stack spacing={1.2}>
                {muscleVolume.map((m) => (
                  <MuscleVolumeCard
                    key={m.muscle}
                    muscle={m.muscle}
                    volume={m.volume}
                  />
                ))}
              </Stack>
            </Stack>
          </Box>

          {/* 🔙 BOTÓN */}
          <PrimaryButton
            label="Volver"
            to={`/workout/${userId}`}
          />

        </Stack>
      </Container>
    </Box>
  );
}