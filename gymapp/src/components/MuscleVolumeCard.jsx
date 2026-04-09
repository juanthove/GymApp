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
            justifyContent: "space-between",
            alignItems: "center",
            px: 2.5,
            py: 1.5,
            borderRadius: "14px",

            background: `linear-gradient(135deg, ${bgColor}, ${bgColorSoft})`,

            border: "4px solid rgba(255,255,255,0.8)",

            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",

            overflow: "hidden" // 👈 importante
        }}
    >
        <Box
            sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "40%",
                background: "linear-gradient(to bottom, rgba(255,255,255,0.35), transparent)",
                pointerEvents: "none"
            }}
            />
        <Box
            sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "30%",
                background: "linear-gradient(to top, rgba(0,0,0,0.08), transparent)",
                pointerEvents: "none"
            }}
        />
      {/* IZQUIERDA */}
      <Box sx={{ position: "relative", display: "flex", alignItems: "center"}}>
        {Icon && (
          <>
            <style>
              {`
                .muscle-icon .muscle-main {
                  fill: currentColor;
                }

                .muscle-icon .muscle-secondary {
                  fill: color-mix(in srgb, currentColor 65%, black);
                }
              `}
            </style>
            <Icon
              className="muscle-icon"
              style={{
                left: -6,
                width: 50,
                height: 50,
                color: baseColor, // 🔥 mismo color que usás en la card
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
                transform: "scale(1.2)",
              }}
            />
          </>
        )}

        <Typography
          sx={{
            fontWeight: 600,
            color: "#444",
            fontSize: "1.25rem",
            pl: 4.5
          }}
        >
          {muscleLabels[muscle] || muscle}
        </Typography>
      </Box>

      {/* DERECHA (KG animados) */}
      <Typography
        sx={{
            fontWeight: 800,
            fontSize: "1.4rem",
            color: textColor,
            textShadow: "0 1px 2px rgba(0,0,0,0.25)",
            animation: animate ? `${pop} 0.4s ease-out` : "none"
        }}
      >
        <span ref={countUpRef} />
        <span style={{ marginLeft: 4 }}>kg</span>
      </Typography>
    </Box>
  );
}