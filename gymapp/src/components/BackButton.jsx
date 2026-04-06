import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

export default function BackButton({ to, sx }) {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(to)}
      sx={{
        display: "inline-flex",
        alignItems: "center",

        fontSize: "3.9rem",
        fontWeight: 600,
        color: "#fff",

        ...sx
      }}
    >
      <ArrowBackIosNewIcon sx={{ filter: "drop-shadow(0 0 2px white)", fontSize: "2.2rem" }} />
    </Box>
  );
}