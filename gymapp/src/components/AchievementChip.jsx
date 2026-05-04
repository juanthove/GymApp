import { Chip } from "@mui/material";
import { lightenColor } from "../utils/colorUtils";

export default function AchievementChip({
  label,
  color = "#999",
  icon = null,
  size = "medium",
  sx = {}
}) {

  const light = lightenColor(color, 0.4);

  return (
    <Chip
      label={label}
      icon={icon}
      sx={{
        height: 32,
        px: 1.2,
        py: 2.2,

        // 🔥 gradiente sutil (clave para profundidad)
        background: `linear-gradient(135deg, ${light}, ${color})`,

        // 🤍 borde
        border: "1px solid rgba(255,255,255,0.6)",
        borderRadius: "999px",

        fontWeight: 600,

        // ✨ sombra externa + interna (relieve)
        boxShadow: `
          0 3px 8px rgba(0,0,0,0.25),
          inset 0 1px 2px rgba(255,255,255,0.4),
          inset 0 -1px 2px rgba(0,0,0,0.2)
        `,

        // 🔥 texto
        "& .MuiChip-label": {
          color: "#fff !important",
          fontSize: "1.3rem",
        },

        // 🔥 icono
        "& .MuiChip-icon": {
          color: "#fff !important",
          fontSize: 27,
        },

        // 💫 hover más pro
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "scale(1.07)",
          boxShadow: `
            0 5px 12px rgba(0,0,0,0.35),
            inset 0 1px 3px rgba(255,255,255,0.5)
          `,
        },

        ...sx
      }}
    />
  );
}