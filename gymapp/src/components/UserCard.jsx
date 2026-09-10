import React, { memo } from "react";
import { Card, CardActionArea, Typography, Box } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

const UserCard = memo(function UserCard({ title, imageUrl, onClick, sx, darkMode = false }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        height: {
          xs: 260,
          md: 300,
        },

        minHeight: {
          xs: 260,
          md: 300,
        },
        transition: "0.3s",
        cursor: "pointer",
        backgroundColor: darkMode ? "#0f172a" : "#fff",
        border: darkMode ? "1px solid rgba(148,163,184,0.25)" : "1px solid rgba(0,0,0,0.08)",
        "&:hover": {
          transform: "scale(1.03)",
          boxShadow: 6,
        },
        ...sx,
      }}
    >
      <CardActionArea sx={{ height: "100%" }} onClick={onClick}>
        {/* IMAGEN */}
        <Box
          sx={{
            height: "70%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: darkMode ? "#334155" : "#ccc",
            overflow: "hidden",
          }}
        >
          {imageUrl ? (
            <Box
              component="img"
              src={imageUrl}
              alt={title}
              loading="lazy"
              decoding="async"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <PersonIcon
              sx={{
                fontSize: {
                  xs: 230,
                  md: 270,
                },
                color: "#9e9e9e",
              }}
            />
          )}
        </Box>

        {/* FOOTER */}
        <Box
          sx={{
            height: "30%",
            backgroundColor: darkMode ? "rgba(15,23,42,0.92)" : "rgba(0,0,0,0.75)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            px: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: darkMode ? "#f8fafc" : "#fff",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {title}
          </Typography>

          {/* LINEA ROJA */}
          <Box
            sx={{
              width: "80%",
              height: "4px",
              mt: 1,
              borderRadius: "10px",
              background: "linear-gradient(90deg, transparent, #e53935, transparent)",
            }}
          />
        </Box>
      </CardActionArea>
    </Card>
  );
});

export default UserCard;
