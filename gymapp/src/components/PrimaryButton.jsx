import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function PrimaryButton({
  label,
  to,
  onClick,
  disabled = false, // 👈 NUEVO
  sx = {}
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return; // 👈 evita acción
    if (onClick) onClick();
    if (to) navigate(to);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled} // 👈 importante para MUI
      sx={{
        px: 4,
        py: 1.5,
        borderRadius: "999px",
        fontWeight: 600,
        fontSize: "0.95rem",
        textTransform: "none",
        color: "#fff",

        background: disabled
          ? "linear-gradient(145deg, #9e9e9e, #757575)" // 👈 gris
          : "linear-gradient(145deg, #4a9dfd, #3379db)",

        boxShadow: disabled
          ? "none"
          : `
            0 6px 12px rgba(0,0,0,0.25),
            inset 0 2px 4px rgba(255,255,255,0.2)
          `,

        opacity: disabled ? 0.7 : 1,
        cursor: disabled ? "not-allowed" : "pointer",

        transition: "all 0.2s ease",

        "&:active": disabled
          ? {}
          : {
              transform: "translateY(2px)",
              boxShadow: `
                inset 0 4px 8px rgba(0,0,0,0.3),
                inset 0 -2px 4px rgba(255,255,255,0.2)
              `
            },

        ...sx
      }}
    >
      {label}
    </Button>
  );
}