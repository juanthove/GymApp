import { Box, Typography, LinearProgress } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

import { achievementColors } from "../config/achievementConfig";
import { lightenColor, darkenColor } from "../utils/colorUtils";

export default function AchievementMiniCard({ achievement, onClick }) {
  const isUnlocked = achievement.unlocked;

  const originalColor = achievementColors[achievement.type] || "#9e9e9e";
  const baseColor = isUnlocked ? originalColor : "#616161";

  const bgColorSoft = lightenColor(baseColor, isUnlocked ? 0.25 : 0.5);
  const bgColorDark = darkenColor(baseColor, 0.2);

  const progressPercent = achievement.requiredValue
    ? Math.min((achievement.progress / achievement.requiredValue) * 100, 100)
    : 0;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("es-UY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const truncateText = (text, maxLength = 22) => {
    if (!text) return "";

    if (text.length <= maxLength) return text;

    const trimmed = text.slice(0, maxLength);

    // 🔥 evita cortar palabras a la mitad feo
    const lastSpace = trimmed.lastIndexOf(" ");

    return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed) + "...";
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1.2",
        p: 1,
        borderRadius: 3,
        cursor: "pointer",

        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between", // 🔥 importante

        background: `linear-gradient(0deg, ${bgColorDark}, ${bgColorSoft})`,
        border: `2px solid ${darkenColor(baseColor, 0.4)}`,
        overflow: "hidden",
      }}
    >
      {/* 🔒 LOCK */}
      {!isUnlocked && (
        <Box
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LockIcon sx={{ fontSize: 16, color: "#fff" }} />
        </Box>
      )}

      {/* 🖼️ IMAGEN + NOMBRE SUPERPUESTO */}
      <Box
        sx={{
          width: "100%",
          height: "60%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* ✨ glow */}
        <Box
          sx={{
            position: "absolute",
            inset: 0, // 🔥 ocupa TODO el contenedor
            background: `radial-gradient(circle, ${bgColorDark} 0%, transparent 60%), 
            repeating-conic-gradient(
              from 0deg at 50% 30%,
              #ffffff77 0deg,
              #ffffffa9 4deg,
              transparent 8deg,
              transparent 19deg
            )`,

            filter: "blur(8px)",
            zIndex: 0,
          }}
        />

        {/* 🖼️ imagen */}
        {achievement.imageUrl && (
          <Box
            component="img"
            src={achievement.imageUrl}
            alt={achievement.name}
            sx={{
              maxWidth: "70%",
              maxHeight: "70%",
              objectFit: "contain",
              zIndex: 1,
              transform: "translateY(-8px)",
              filter: isUnlocked ? "none" : "grayscale(100%) opacity(0.7)",
            }}
          />
        )}

        {/* 🏆 NOMBRE SUPERPUESTO */}
        <Typography
          sx={{
            position: "absolute",
            bottom: -10, // 🔥 lo baja un poco sobre la imagen
            left: "50%",
            transform: "translateX(-50%)",

            width: "90%",
            textAlign: "center",

            fontWeight: 900,
            fontSize: "1.1rem",
            color: "#fff",

            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",

            // ✨ sombra para que resalte SIEMPRE
            textShadow: `
              0 2px 6px rgba(0,0,0,0.8),
              0 0 10px rgba(0,0,0,0.6)
            `,

            zIndex: 2,
          }}
        >
          {achievement.name}
        </Typography>
      </Box>

      {/* 📊 CONTENIDO DINÁMICO */}
      {isUnlocked ? (
        <Typography
          sx={{
            fontSize: "1.1rem",
            textAlign: "center",
            color: "#fff",
            mt: 1,
          }}
        >
          {achievement.unlockedAt ? `Completado el ${formatDate(achievement.unlockedAt)}` : "Completado"}
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.2,
            mt: 1,
          }}
        >
          {/* 📊 BARRA */}
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              flex: 1,
              height: 8, // 👈 más gruesa
              borderRadius: 10,
              overflow: "hidden",

              // fondo de la barra
              backgroundColor: lightenColor(baseColor, 0.85),

              // sombra exterior (levanta la barra)
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",

              "& .MuiLinearProgress-bar": {
                borderRadius: 10,

                // degradado más marcado
                background: `linear-gradient(
                  90deg,
                  ${baseColor} 0%,
                  ${lightenColor(baseColor, 0.2)} 50%,
                  ${baseColor} 100%
                )`,

                // ✨ brillo interno
                boxShadow: `
                  inset 0 1px 2px rgba(255,255,255,0.3),
                  inset 0 -1px 2px rgba(0,0,0,0.3)
                `,
              },
            }}
          />

          {/* 🔢 PORCENTAJE */}
          <Typography
            sx={{
              minWidth: 35,
              fontSize: "1rem",
              fontWeight: 700,
              color: "#fff",
              textAlign: "right",

              textShadow: "0 1px 3px rgba(0,0,0,0.7)",
            }}
          >
            {Math.round(progressPercent)}%
          </Typography>
        </Box>
      )}
    </Box>
  );
}
