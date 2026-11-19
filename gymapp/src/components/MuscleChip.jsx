import { Chip } from "@mui/material";
import { muscleLabels, muscleColors } from "../config/muscleConfig";
import { lightenColor } from "../utils/colorUtils";

export default function MuscleChip({ muscle, size = "small", chipSx = {} }) {
  if (!muscle) return null;

  const base = muscleColors[muscle] || "#999";
  const light = lightenColor(base, 0.4);

  return (
    <Chip
      label={muscleLabels[muscle] || muscle}
      size={size}
      sx={{
        color: "#fff",
        fontWeight: 600,
        background: `linear-gradient(135deg, ${light}, ${base})`,
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow: `
          0 3px 8px rgba(0,0,0,0.25),
          inset 0 1px 2px rgba(255,255,255,0.4)
        `,
        borderRadius: "999px",
        transition: "0.2s",
        "&:hover": {
          transform: "scale(1.05)",
        },
        ...chipSx,
      }}
    />
  );
}
