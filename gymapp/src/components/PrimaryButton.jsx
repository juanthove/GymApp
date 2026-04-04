import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function PrimaryButton({
  label,
  to,
  onClick,
  color = "blue", // 🔥 opcional para futuro
  sx = {}
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    if (to) navigate(to);
  };

  return (
    <Button
      onClick={handleClick}
      sx={{
        px: 4,
        py: 1.5,
        borderRadius: "999px",
        fontWeight: 600,
        fontSize: "0.95rem",
        textTransform: "uppercase",
        color: "#fff",

        // 🎨 gradiente celeste default
        background: "linear-gradient(145deg, #4a9dfd, #3379db)",

        boxShadow: `
          0 6px 12px rgba(0,0,0,0.25),
          inset 0 2px 4px rgba(255,255,255,0.2)
        `,

        transition: "all 0.2s ease",

        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `
            0 10px 18px rgba(0,0,0,0.3),
            inset 0 2px 4px rgba(255,255,255,0.25)
          `
        },

        "&:active": {
          transform: "translateY(2px)",
          boxShadow: `
            inset 0 4px 8px rgba(0,0,0,0.3),
            inset 0 -2px 4px rgba(255,255,255,0.2)
          `
        },

        ...sx // 🔥 para overrides
      }}
    >
      {label}
    </Button>
  );
}