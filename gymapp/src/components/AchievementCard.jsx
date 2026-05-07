import { Box, Typography, Stack, LinearProgress } from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LockIcon from "@mui/icons-material/Lock";
import ArmIcon from "../assets/musclesAchievements/arm.svg";
import ChestIcon from "../assets/musclesAchievements/chest.svg";
import LegIcon from "../assets/musclesAchievements/leg.svg";

import AchievementChip from "../components/AchievementChip";

import { muscleLabels, muscleGroups } from "../config/muscleConfig";
import { achievementColors } from "../config/achievementConfig";
import { lightenColor, darkenColor } from "../utils/colorUtils";

const muscleGroupIcons = {
  ARM: ArmIcon,
  LEG: LegIcon,
  CHEST: ChestIcon,
};

export default function AchievementCard({ achievement }) {
  const isUnlocked = achievement.unlocked;

  const isStreak = achievement.type === "STREAK";
  const isConsistency = achievement.type === "CONSISTENCY";
  const isVolume = achievement.type === "VOLUME";

  const isGeneralVolume = !achievement.muscle && !achievement.exerciseName && isVolume;

  const originalColor = achievementColors[achievement.type] || "#9e9e9e";

  const baseColor = isUnlocked ? originalColor : "#616161";

  const bgColorSoft = lightenColor(baseColor, isUnlocked ? 0.35 : 0.5);
  const bgColorDark = darkenColor(baseColor, 0.2);

  const progressPercent = achievement.requiredValue
    ? Math.min((achievement.progress / achievement.requiredValue) * 100, 100)
    : 0;

  const formatNumber = (num) => new Intl.NumberFormat("es-UY").format(num);

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

  const effectiveMuscle = achievement.muscle || achievement.exerciseMuscle;

  const muscleGroup = effectiveMuscle ? muscleGroups[effectiveMuscle] : null;

  const muscleIcon = muscleGroup ? muscleGroupIcons[muscleGroup] : null;

  const iconElement = muscleIcon ? (
    <Box
      component="img"
      src={muscleIcon}
      alt="muscle icon"
      sx={{
        width: 45,
        height: 45,
        filter: "brightness(0) invert(1)",
      }}
    />
  ) : null;

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: 800,
        width: 650,
        margin: "0 auto",
        px: 2,
        py: 2,
        borderRadius: 4,
        gap: 1,
        background: `linear-gradient(0deg, ${bgColorDark}, ${bgColorSoft})`,
        border: `2px solid ${darkenColor(baseColor, 0.4)}`,
        boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
        filter: isUnlocked ? "none" : "grayscale(0.7)",
        textAlign: "center",
      }}
    >
      {/* 🔒 LOCK */}
      {!isUnlocked && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 58,
            height: 58,
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LockIcon sx={{ fontSize: 36, color: "#fff" }} />
        </Box>
      )}

      <Box
        sx={{
          width: "100%",
          height: "55%",
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
            inset: 0,
            background: `radial-gradient(circle, ${bgColorDark} 0%, transparent 60%), 
            repeating-conic-gradient(
              from 0deg at 50% 30%,
              #ffffff77 0deg,
              #ffffffa9 4deg,
              transparent 8deg,
              transparent 19deg
            )`,
            filter: "blur(16px)",
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
              transform: "translateY(-30px)",
              filter: isUnlocked ? "none" : "grayscale(100%) opacity(0.6)",
            }}
          />
        )}

        {/* 🏆 nombre superpuesto */}
        <Typography
          sx={{
            position: "absolute",
            bottom: -12,
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            textAlign: "center",
            fontWeight: 900,
            fontSize: "1.6rem",
            color: "#fff",

            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",

            textShadow: `
              0 3px 10px rgba(0,0,0,0.9),
              0 0 20px rgba(0,0,0,0.7)
            `,

            zIndex: 2,
          }}
        >
          {achievement.name}
        </Typography>
      </Box>

      {/* 🔹 INFO */}
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" flexWrap="wrap">
        {/* 📅 STREAK / CONSISTENCY */}
        {(isStreak || isConsistency) && (
          <AchievementChip label="General" color={baseColor} icon={<CalendarMonthIcon />} />
        )}

        {/* 💪 MÚSCULO */}
        {achievement.muscle && (
          <AchievementChip label={muscleLabels[achievement.muscle]} color={baseColor} icon={iconElement} />
        )}

        {/* 🏋️ EJERCICIO */}
        {achievement.exerciseName && (
          <AchievementChip
            label={achievement.exerciseName}
            color={baseColor}
            icon={iconElement}
            variant="outlined"
            sx={{
              borderColor: baseColor,
              color: baseColor,
            }}
          />
        )}

        {/* 🏋️ GENERAL VOLUMEN */}
        {isGeneralVolume && <AchievementChip label="General" color={baseColor} icon={<FitnessCenterIcon />} />}
      </Stack>

      {/* 🎯 OBJETIVO */}
      <Typography
        sx={{
          fontWeight: 900,
          fontSize: "1.7rem",
          color: "#fff",
        }}
      >
        {formatNumber(achievement.requiredValue)} {isVolume ? "kg" : isStreak ? "días seguidos" : "días entrenados"}
      </Typography>

      {/* 📊 PROGRESO */}
      <Box sx={{ width: "100%", mt: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            height: 18, // 👈 más alta
            borderRadius: 999,
            overflow: "hidden",

            // 🎨 fondo (track)
            backgroundColor: lightenColor(baseColor, 0.7),

            // ✨ profundidad real (no solo glow)
            boxShadow: `
              inset 0 2px 4px rgba(0,0,0,0.5),
              inset 0 -1px 2px rgba(255,255,255,0.2)
            `,

            "& .MuiLinearProgress-bar": {
              borderRadius: 999,

              // 🔥 gradiente más “premium”
              background: `linear-gradient(
                90deg,
                ${darkenColor(baseColor, 0.2)} 0%,
                ${baseColor} 40%,
                ${lightenColor(baseColor, 0.2)} 60%,
                ${lightenColor(baseColor, 0.3)} 100%
              )`,

              // ✨ brillo + relieve
              boxShadow: `
                0 0 10px ${baseColor},
                inset 0 2px 3px rgba(255,255,255,0.35),
                inset 0 -2px 4px rgba(0,0,0,0.4)
              `,
            },
          }}
        />

        <Typography
          sx={{
            mt: 0.5,
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#ffffff",
          }}
        >
          {formatNumber(displayProgress ?? 0)} / {formatNumber(achievement.requiredValue)}
        </Typography>
      </Box>

      {/* 📅 COMPLETADO */}
      {isUnlocked && achievement.unlockedAt && (
        <Typography
          sx={{
            mt: 0.5,
            fontSize: "1.8rem",
            fontWeight: 500,
            color: "#ffffff",
          }}
        >
          Completado el {formatDate(achievement.unlockedAt)}
        </Typography>
      )}
    </Box>
  );
}
