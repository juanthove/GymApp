import { Box, Typography } from "@mui/material";
import { useCountUp } from "react-countup";
import { useEffect, useRef } from "react";

import { muscleColors} from "../config/muscleConfig"
import { lightenColor, darkenColor} from "../utils/colorUtils"

export default function PRCard({ row }) {

  const countUpRef = useRef(null);

  const baseColor = muscleColors[row.muscle] || "#999";
  const bgColor = lightenColor(baseColor, 0.6);
  const bgColorSoft = lightenColor(baseColor, 0.75);
  const textColor = darkenColor(baseColor, 0.2);

  const { start } = useCountUp({
    ref: countUpRef,
    start: 0,
    end: row.weight,
    duration: 1.2,
    separator: ".",
    startOnMount: false,
  });

  useEffect(() => {
    start();
  }, [row.weight, start]);

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",

        height: 270,
        px: 2,
        py: 2,
        borderRadius: 4,

        gap: 1,

        background: `linear-gradient(135deg, ${bgColor}, ${bgColorSoft})`,
        border: "3px solid rgba(255,255,255,0.7)",
        boxShadow: "0 6px 18px rgba(0,0,0,0.12)",

        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* ✨ brillo arriba */}
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

      {/* 🏋️ Nombre */}
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: "1.6rem",
          color: "#000000",
        }}
      >
        {row.name}
      </Typography>

      {/* 🖼️ Imagen */}
      <Box
        sx={{
            height: 110,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}
        >
        {row.imageUrl && (
            <Box
            component="img"
            src={row.imageUrl}
            alt={row.name}
            sx={{
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
            }}
            />
        )}
      </Box>

      {/* ⚖️ Peso */}
      <Typography
        sx={{
          fontWeight: 900,
          fontSize: "1.5rem",
          color: textColor,
          textShadow: "0 2px 4px rgba(0,0,0,0.25)",
        }}
      >
        <span ref={countUpRef} /> kg
      </Typography>

      {/* 📅 Fecha */}
      <Typography
        sx={{
          fontSize: "1.3rem",
          opacity: 0.8,
          fontWeight: 500,
        }}
      >
        {new Date(row.date).toLocaleDateString("es-UY", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </Typography>
    </Box>
  );
}