import { Box, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import { useEffect, useRef, useState } from "react";
import { useCountUp } from "react-countup";

import ChestIcon from "../assets/muscles/chest.svg?react";
import BackIcon from "../assets/muscles/back.svg?react";
import ShouldersIcon from "../assets/muscles/shoulders.svg?react";
import BicepsIcon from "../assets/muscles/biceps.svg?react";
import TricepsIcon from "../assets/muscles/triceps.svg?react";
import ForearmsIcon from "../assets/muscles/forearms.svg?react";
import QuadricepsIcon from "../assets/muscles/quadriceps.svg?react";
import GlutesIcon from "../assets/muscles/glutes.svg?react";
import HamstringsIcon from "../assets/muscles/hamstrings.svg?react";
import AductorsIcon from "../assets/muscles/aductors.svg?react";
import AbductorsIcon from "../assets/muscles/abductors.svg?react";
import CalvesIcon from "../assets/muscles/calves.svg?react";
import AbsIcon from "../assets/muscles/abdominals.svg?react";

const muscleIcons = {
  CHEST: ChestIcon,
  BACK: BackIcon,
  SHOULDERS: ShouldersIcon,
  BICEPS: BicepsIcon,
  TRICEPS: TricepsIcon,
  FOREARMS: ForearmsIcon,
  QUADRICEPS: QuadricepsIcon,
  GLUTES: GlutesIcon,
  HAMSTRINGS: HamstringsIcon,
  ADDUCTORS: AductorsIcon,
  ABDUCTORS: AbductorsIcon,
  CALVES: CalvesIcon,
  ABDOMINALS: AbsIcon
};

// 🎨 labels
const muscleLabels = {
  CHEST: "Pecho",
  BACK: "Espalda",
  SHOULDERS: "Hombros",
  BICEPS: "Bíceps",
  TRICEPS: "Tríceps",
  FOREARMS: "Antebrazos",
  QUADRICEPS: "Cuádriceps",
  GLUTES: "Glúteos",
  HAMSTRINGS: "Femorales",
  ADDUCTORS: "Aductores",
  ABDUCTORS: "Abductores",
  CALVES: "Gemelos",
  ABDOMINALS: "Abdominales"
};

// 🎨 colores base
const colorMap = {
  CHEST: "#ef5350",
  BACK: "#42a5f5",
  SHOULDERS: "#ffb74d",
  BICEPS: "#66bb6a",
  TRICEPS: "#26a69a",
  FOREARMS: "#8d6e63",
  QUADRICEPS: "#7e57c2",
  GLUTES: "#ab47bc",
  HAMSTRINGS: "#5c6bc0",
  ADDUCTORS: "#8bc34a", 
  ABDUCTORS: "#4db6ac",
  CALVES: "#29b6f6",
  ABDOMINALS: "#ec407a"
};

const strokeMap = {
  CHEST: 900,
  BACK: 1200,
  SHOULDERS: 900,
  BICEPS: 4800,
  TRICEPS: 4200,
  FOREARMS: 1600,
  QUADRICEPS: 2100,
  GLUTES: 2000,
  HAMSTRINGS: 2100,
  ADDUCTORS: 2500,
  ABDUCTORS: 2000,
  CALVES: 1800,
  ABDOMINALS: 1100
};

// 💥 animación pop
const pop = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(1.12); }
  70% { transform: scale(0.98); }
  100% { transform: scale(1); }
`;

// 🎨 helper para aclarar color
const lightenColor = (hex, amount = 0.85) => {
  const num = parseInt(hex.replace("#", ""), 16);

  let r = (num >> 16) + (255 - (num >> 16)) * amount;
  let g = ((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * amount;
  let b = (num & 0x0000ff) + (255 - (num & 0x0000ff)) * amount;

  return `rgb(${r}, ${g}, ${b})`;
};

const darkenColor = (hex, amount = 0.25) => {
  const num = parseInt(hex.replace("#", ""), 16);

  let r = (num >> 16) * (1 - amount);
  let g = ((num >> 8) & 0x00ff) * (1 - amount);
  let b = (num & 0x0000ff) * (1 - amount);

  return `rgb(${r}, ${g}, ${b})`;
};

export default function MuscleVolumeCard({ muscle, volume }) {
  const [animate, setAnimate] = useState(false);
  const countUpRef = useRef(null);

  const baseColor = colorMap[muscle] || "#999";
  const bgColor = lightenColor(baseColor, 0.6);
  const bgColorSoft = lightenColor(baseColor, 0.7);
  const textColor = darkenColor(baseColor, 0.15);
  const Icon = muscleIcons[muscle];

  const { start } = useCountUp({
    ref: countUpRef,
    start: 0,
    end: volume,
    duration: 1.2,
    separator: ".",
    startOnMount: false,
    onEnd: () => {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 400);
    }
  });

  useEffect(() => {
    start();
  }, [volume, start]);

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column", // 👈 vertical
        alignItems: "center",
        justifyContent: "space-between",

        width: "100%",
        height: 220, // 👈 forma rectangular/cuadrada
        px: 2,
        py: 1.5,
        borderRadius: "16px",

        background: `linear-gradient(135deg, ${bgColor}, ${bgColorSoft})`,
        border: "4px solid rgba(255,255,255,0.8)",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",

        overflow: "hidden",
      }}
    >
      {/* brillo arriba */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "35%",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.35), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* sombra abajo */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "30%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.08), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* 🧠 NOMBRE */}
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "1.3rem",
          color: "#444",
          textAlign: "center",
        }}
      >
        {muscleLabels[muscle] || muscle}
      </Typography>

      {/* 💪 ICONO */}
      {Icon && (
        <>
          <style>
            {`
              /* 🎨 COLOR */
              .muscle-icon .muscle-main {
                fill: color-mix(in srgb, currentColor 65%, black);
              }

              .muscle-icon .muscle-secondary {
                fill: currentColor;
              }

              /* ✏️ DIBUJO */
              .muscle-icon #draw-layer path {
                fill: none;
                stroke: currentColor;
                stroke-width: 2;

                stroke-dasharray: var(--stroke-length);
                stroke-dashoffset: var(--stroke-length);

                animation: draw 1s ease forwards, hideStroke 0.3s ease forwards;
                animation-delay: 0s, 1s; /* 👈 primero dibuja, después desaparece */
              }

              @keyframes draw {
                to {
                  stroke-dashoffset: 0;
                }
              }

              @keyframes hideStroke {
                to {
                  opacity: 0;
                }
              }

              /* 🎨 COLOR APARECE */
              .muscle-icon #fill-layer {
                opacity: 0;
                animation: fadeIn 0.4s ease forwards;
                animation-delay: 0.7s; /* 👈 aparece antes de que desaparezca el stroke */
              }

              @keyframes fadeIn {
                to {
                  opacity: 1;
                }
              }
            `}
            </style>

          <Icon
            className="muscle-icon"
            style={{
              width: 130,
              height: 130,
              color: baseColor,
              "--stroke-length": strokeMap[muscle] || 1000,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
            }}
          />
        </>
      )}

      {/* ⚖️ KG */}
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: "1.3rem",
          color: textColor,
          textShadow: "0 1px 2px rgba(0,0,0,0.25)",
          animation: animate ? `${pop} 0.4s ease-out` : "none",
        }}
      >
        <span ref={countUpRef} />
        <span style={{ marginLeft: 4 }}>kg</span>
      </Typography>
    </Box>
  );
}