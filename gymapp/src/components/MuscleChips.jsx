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
    CALVES: "#29b6f6",
    ABDOMINALS: "#ec407a",
  };

export default function MuscleChips({ muscles = [], size = "small", chipSx = {} }) {
  if (!muscles.length) return null;

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {muscles.map((m) => (
        <Chip
          key={m}
          label={muscleLabels[m] || m}
          size={size}
          sx={{
            color: "#fff",
            bgcolor: colorMap[m], 
            ...chipSx}}
        />
      ))}
    </Stack>
  );
}