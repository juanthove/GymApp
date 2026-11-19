import { Box, Typography, Stack } from "@mui/material";
import { useCountUp } from "react-countup";
import { useEffect, useRef } from "react";
import { useDarkMode } from "../context/DarkModeContext";

import MuscleChip from "./MuscleChip";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

export default function PRMiniCard({ row }) {
  const { darkMode } = useDarkMode();
  const countUpRef = useRef(null);

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
        justifyContent: "space-between",
        height: {
          xs: 175,
          md: 190,
        },
        px: 2,
        py: 1.5,
        borderRadius: 3,

        background: darkMode ? "#17263d" : "#fff",
        color: darkMode ? "#f8fafc" : "#111",

        border: darkMode ? "1px solid rgba(148,163,184,0.18)" : "1px solid rgba(0,0,0,0.08)",

        borderBottom: "4px solid #ff2020",

        boxShadow: darkMode ? "0 4px 14px rgba(0,0,0,0.3)" : "0 3px 10px rgba(0,0,0,0.10)",

        overflow: "hidden",
      }}
    >
      {/* Imagen grande a la derecha */}
      {row.imageUrl && (
        <Box
          component="img"
          src={row.imageUrl}
          alt={row.name}
          loading="lazy"
          decoding="async"
          sx={{
            position: "absolute",
            right: 8,
            top: "60%",
            transform: "translateY(-50%)",
            width: {
              xs: 105,
              md: 125,
            },
            height: {
              xs: 115,
              md: 135,
            },
            objectFit: "contain",
            opacity: darkMode ? 0.9 : 1,
            filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.18))",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Contenido izquierdo */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "65%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Nombre */}
        <Stack direction="row" alignItems="center" spacing={0.7} sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              lineHeight: 1.2,
              minWidth: 0,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
              overflowWrap: "anywhere",
            }}
          >
            {row.name}
          </Typography>
        </Stack>

        {/* Peso */}
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: {
              xs: "1.9rem",
              md: "2.2rem",
            },
            lineHeight: 1,
          }}
        >
          <span ref={countUpRef} />{" "}
          <Typography
            component="span"
            sx={{
              fontSize: "1rem",
              fontWeight: 700,
            }}
          >
            kg
          </Typography>
        </Typography>

        {/* Músculo */}
        <Box>
          <MuscleChip
            muscle={row.muscle}
            size="small"
            chipSx={{
              height: 25,
              fontSize: "0.75rem",
              fontWeight: 700,
              color: darkMode ? "#ff8585" : "#d71920",
              background: darkMode ? "rgba(255,32,32,0.18)" : "rgba(255,32,32,0.12)",
              border: "none",
              boxShadow: "none",
              "&:hover": {
                transform: "none",
              },
            }}
          />
        </Box>

        {/* Fecha */}
        <Stack direction="row" alignItems="center" spacing={0.7}>
          <CalendarMonthIcon
            sx={{
              fontSize: 17,
              color: darkMode ? "#aab8ca" : "#555",
            }}
          />

          <Typography
            sx={{
              fontSize: "0.85rem",
              color: darkMode ? "#cbd5e1" : "#555",
              fontWeight: 500,
            }}
          >
            {new Date(row.date).toLocaleDateString("es-UY", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </Typography>
        </Stack>
      </Box>

      <EmojiEventsIcon
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          color: "#e5a000",
          fontSize: 23,
          zIndex: 2,
        }}
      />
    </Box>
  );
}
