import { Chip, Stack } from "@mui/material";

import { muscleLabels, muscleColors} from "../config/muscleConfig"
import { lightenColor } from "../utils/colorUtils"

export default function MuscleChips({ muscles = [], size = "small", chipSx = {} }) {
  if (!muscles.length) return null;

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
      {muscles.map((m) => {
        const base = muscleColors[m] || "#999";
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