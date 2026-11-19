import { Box, Typography, Stack, Divider } from "@mui/material";
import { useDarkMode } from "../context/DarkModeContext";

import MuscleChip from "./MuscleChip";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

export default function PRCard({ row }) {
  const { darkMode } = useDarkMode();

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: 600,
        minHeight: { xs: 420, md: 480 },
        mx: "auto",
        px: 3,
        py: 2.5,
        borderRadius: 3,

        background: darkMode ? "#17263d" : "#fff",
        color: darkMode ? "#f8fafc" : "#111",

        border: darkMode ? "1px solid rgba(148,163,184,0.18)" : "1px solid rgba(0,0,0,0.08)",

        borderBottom: "4px solid #ff2020",

        boxShadow: darkMode ? "0 4px 14px rgba(0,0,0,0.3)" : "0 3px 10px rgba(0,0,0,0.10)",

        overflow: "hidden",
      }}
    >
      {/* Encabezado */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ position: "relative", zIndex: 2 }}
      >
        <Typography
          sx={{
            fontSize: "0.8rem",
            fontWeight: 800,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: darkMode ? "#ff8585" : "#d71920",
          }}
        >
          Récord personal
        </Typography>

        <EmojiEventsIcon sx={{ color: "#e5a000", fontSize: 30 }} />
      </Stack>

      {/* Imagen */}
      {row.imageUrl && (
        <Box
          component="img"
          src={row.imageUrl}
          alt={row.name}
          loading="lazy"
          decoding="async"
          sx={{
            position: "absolute",
            right: { xs: 40, md: 50 },
            top: "43%",
            transform: "translateY(-50%)",
            width: { xs: 145, md: 190 },
            height: { xs: 170, md: 210 },
            objectFit: "contain",
            opacity: darkMode ? 0.9 : 1,
            filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.18))",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Información principal */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "65%",
          mt: 3,
        }}
      >
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: { xs: "1.3rem", md: "1.6rem" },
            lineHeight: 1.2,
            overflowWrap: "anywhere",
          }}
        >
          {row.name}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <MuscleChip
            muscle={row.muscle}
            size="small"
            chipSx={{
              height: 27,
              fontSize: "0.8rem",
              fontWeight: 700,
              color: darkMode ? "#ff8585" : "#d71920",
              background: darkMode ? "rgba(255,32,32,0.18)" : "rgba(255,32,32,0.12)",
              border: "none",
              boxShadow: "none",
              "&:hover": { transform: "none" },
            }}
          />
        </Box>

        <Box
          sx={{
            mt: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: darkMode ? "#aab8ca" : "#666",
            }}
          >
            Mejor marca
          </Typography>

          <Stack direction="row" alignItems="baseline" spacing={0.7}>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: "3rem", md: "3.8rem" },
                lineHeight: 1.1,
              }}
            >
              {new Intl.NumberFormat("es-UY").format(row.weight)}
            </Typography>

            <Typography sx={{ fontWeight: 700, fontSize: "1.2rem" }}>kg</Typography>
          </Stack>
        </Box>
      </Box>

      <Divider
        sx={{
          my: 2,
          borderColor: darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
        }}
      />

      {/* Fecha */}
      <Stack direction="column" alignItems="center" spacing={0.5} sx={{ width: "100%", textAlign: "center" }}>
        <CalendarMonthIcon
          sx={{
            fontSize: 24,
            color: darkMode ? "#aab8ca" : "#555",
          }}
        />

        <Typography
          sx={{
            fontSize: "0.9rem",
            color: darkMode ? "#aab8ca" : "#777",
            fontWeight: 600,
          }}
        >
          Conseguido el
        </Typography>

        <Typography sx={{ fontSize: "1.2rem", fontWeight: 700 }}>{formatDate(row.date)}</Typography>
      </Stack>
    </Box>
  );
}
