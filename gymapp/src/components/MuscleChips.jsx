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

export default function MuscleChips({ muscles = [] }) {
  if (!muscles.length) return null;

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {muscles.map((m) => (
        <Chip
          key={m}
          label={muscleLabels[m] || m}
          size="small"
        />
      ))}
    </Stack>
  );
}