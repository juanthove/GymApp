import { Chip, Stack } from "@mui/material";

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

// 🎨 helpers
const lightenColor = (hex, amount = 0.3) => {
  const num = parseInt(hex.replace("#", ""), 16);

  let r = (num >> 16) + (255 - (num >> 16)) * amount;
  let g = ((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * amount;
  let b = (num & 0x0000ff) + (255 - (num & 0x0000ff)) * amount;

  return `rgb(${r}, ${g}, ${b})`;
};

export default function MuscleChips({ muscles = [], size = "small", chipSx = {} }) {
  if (!muscles.length) return null;

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
      {muscles.map((m) => {
        const base = colorMap[m] || "#999";
        const light = lightenColor(base, 0.4);

        return (
          <Chip
            key={m}
            label={muscleLabels[m] || m}
            size={size}
            sx={{
              color: "#fff",
              fontWeight: 600,

              // 🌈 fondo con gradiente
              background: `linear-gradient(135deg, ${light}, ${base})`,

              // 🤍 borde blanco
              border: "1px solid rgba(255,255,255,0.7)",

              // ✨ efecto “glass + profundidad”
              boxShadow: `
                0 3px 8px rgba(0,0,0,0.25),
                inset 0 1px 2px rgba(255,255,255,0.4)
              `,

              // 🎯 forma más pill
              borderRadius: "999px",

              // 💫 hover suave
              transition: "0.2s",
              "&:hover": {
                transform: "scale(1.05)"
              },

              ...chipSx
            }}
          />
        );
      })}
    </Stack>
  );
}