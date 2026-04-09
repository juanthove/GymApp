import { Card, Typography, Box } from "@mui/material";
import { keyframes } from "@mui/system";
import { useState, useEffect } from "react";

export default function StatCard({ label, value, unit }) {

  const pop = keyframes`
    0% { transform: scale(1); }
    40% { transform: scale(1.1); }
    100% { transform: scale(1); }
  `;

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (value !== undefined) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 300);
    }
  }, [value]);

  return (
    <Card
      sx={{
        borderRadius: 4,
        px: 3,
        py: 2.5,
        width: "100%",
        textAlign: "center",
        background: "#f7f7f7",
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)"
      }}
    >
      <Typography
        sx={{
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "#555",
          mb: 1
        }}
      >
        {label}
      </Typography>

      <Box
        sx={{
          height: "1px",
          width: "100%",
          backgroundColor: "#ddd",
          mb: 1.5
        }}
      />

      <Typography
        sx={{
          fontSize: "2.5rem",
          fontWeight: 800,
          color: "#d32f2f",
          animation: animate ? `${pop} 0.3s ease-out` : "none"
        }}
      >
        {value}
        {unit && (
          <Box
            component="span"
            sx={{ fontSize: "1.4rem", ml: 0.5 }}
          >
            {unit}
          </Box>
        )}
      </Typography>
    </Card>
  );
}