import {
  Box,
  Typography,
  Stack,
  LinearProgress
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LockIcon from "@mui/icons-material/Lock";

import AchievementChip from "../components/AchievementChip";

import { muscleLabels, muscleColors } from "../config/muscleConfig";
import { lightenColor, darkenColor } from "../utils/colorUtils";

export default function AchievementCard({ achievement }) {

  const isUnlocked = achievement.unlocked;

  const isStreak = achievement.type === "STREAK";
  const isConsistency = achievement.type === "CONSISTENCY";
  const isVolume = achievement.type === "VOLUME";

  const isGeneralVolume =
    !achievement.muscle &&
    !achievement.exerciseName &&
    isVolume;

  const typeColors = {
    VOLUME: "#ff7043",
    STREAK: "#42a5f5",
    CONSISTENCY: "#ab47bc"
  };

  let originalColor;

  if (achievement.muscle) {
    originalColor = muscleColors[achievement.muscle];
  } else {
    originalColor = typeColors[achievement.type] || "#9e9e9e";
  }

  const baseColor = isUnlocked ? originalColor : "#616161";

  const bgColor = lightenColor(baseColor, isUnlocked ? 0.65 : 0.3);
  const bgColorSoft = lightenColor(baseColor, isUnlocked ? 0.8 : 0.5);
  const textColor = darkenColor(baseColor, 0.3);

  const progressPercent = achievement.requiredValue
    ? Math.min((achievement.progress / achievement.requiredValue) * 100, 100)
    : 0;

  const formatNumber = (num) =>
    new Intl.NumberFormat("es-UY").format(num);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("es-UY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const displayProgress = achievement.requiredValue
    ? Math.min(achievement.progress, achievement.requiredValue)
    : achievement.progress;

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: 300,
        px: 2,
        py: 2,
        borderRadius: 4,
        gap: 1,
        background: `linear-gradient(135deg, ${bgColor}, ${bgColorSoft})`,
        border: "3px solid rgba(255,255,255,0.7)",
        boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
        opacity: isUnlocked ? 1 : 0.85,
        filter: isUnlocked ? "none" : "grayscale(0.7)",
        textAlign: "center",
      }}
    >
      {/* 🔒 LOCK */}
      {!isUnlocked && (
        <LockIcon
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            fontSize: 36,
            color: "#424242",
          }}
        />
      )}

      {/* ✨ brillo */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "35%",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* 🏆 NOMBRE */}
      <Typography
        sx={{
          fontWeight: 900,
          fontSize: "1.6rem",
          letterSpacing: "0.5px",
          pr: 2,
          pl: 2,
        }}
      >
        {achievement.name}
      </Typography>

      {/* 🔹 INFO */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
      >
        {/* 📅 STREAK / CONSISTENCY */}
        {(isStreak || isConsistency) && (
          <AchievementChip
            label="General"
            color={baseColor}
            icon={<CalendarMonthIcon />}
          />
        )}

        {/* 💪 MÚSCULO */}
        {achievement.muscle && (
          <AchievementChip
            label={muscleLabels[achievement.muscle]}
            color={baseColor}
          />
        )}

        {/* 🏋️ EJERCICIO */}
        {achievement.exerciseName && (
          <AchievementChip
            label={achievement.exerciseName}
            color={baseColor}
            variant="outlined"
            sx={{
              borderColor: baseColor,
              color: baseColor
            }}
          />
        )}

        {/* 🏋️ GENERAL VOLUMEN */}
        {isGeneralVolume && (
          <AchievementChip
            label="General"
            color={baseColor}
            icon={<FitnessCenterIcon />}
          />
        )}
      </Stack>

      {/* 🎯 OBJETIVO */}
      <Typography
        sx={{
          fontWeight: 900,
          fontSize: "1.4rem",
          color: textColor,
        }}
      >
        {formatNumber(achievement.requiredValue)}{" "}
        {isVolume
          ? "kg"
          : isStreak
            ? "días seguidos"
            : "días"}
      </Typography>

      {/* 📊 PROGRESO */}
      <Box sx={{ width: "100%", mt: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            height: 14, // 🔥 más gruesa
            borderRadius: 999,

            // 🎨 fondo (track)
            backgroundColor: lightenColor(baseColor, 0.75),
            boxShadow: `
              0 0 3px ${baseColor},
              0 0 5px ${baseColor}
            `,

            // 🎯 barra de progreso
            "& .MuiLinearProgress-bar": {
              borderRadius: 999,

              // 🔥 color más vivo
              background: `linear-gradient(90deg, ${baseColor}, ${lightenColor(baseColor, 0.2)})`,

              // ✨ relieve / glow
              boxShadow: `
                0 0 8px ${baseColor},
                inset 0 -2px 4px rgba(0,0,0,0.25),
                inset 0 2px 4px rgba(255,255,255,0.4)
              `,
            }
          }}
        />

        <Typography
          sx={{
            mt: 0.5,
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#444",
          }}
        >
          {formatNumber(displayProgress ?? 0)} /{" "}
          {formatNumber(achievement.requiredValue)}
        </Typography>
      </Box>

      {/* 📅 COMPLETADO */}
      {isUnlocked && achievement.unlockedAt && (
        <Typography
          sx={{
            mt: 0.5,
            fontSize: "1.2rem",
            fontWeight: 500,
            color: "#000000",
          }}
        >
          Completado el {formatDate(achievement.unlockedAt)}
        </Typography>
      )}
    </Box>
  );
}