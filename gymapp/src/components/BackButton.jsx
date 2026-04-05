import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function BackButton({ to, sx }) {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(to)}
      sx={{
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",

        fontSize: "3rem",
        fontWeight: 600,
        color: "#fff",

        transition: "0.2s",

        "&:hover": {
          transform: "translateX(-4px)",
          opacity: 0.8
        },

        ...sx
      }}
    >
      ‹
    </Box>
  );
}