// UserCard.jsx
import { Card, CardActionArea, Typography, Box } from "@mui/material";

export default function UserCard({ title, imageUrl, onClick, sx }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        height: 300,
        minHeight: 300,
        transition: "0.3s",
        cursor: "pointer",
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
            backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "#ccc",
          }}
        />

        {/* FOOTER */}
        <Box
          sx={{
            height: "30%",
            backgroundColor: "rgba(0,0,0,0.75)",
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
              color: "#fff",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {title}
          </Typography>

          {/* línea roja */}
          <Box
            sx={{
              width: "80%",
              height: "4px",
              mt: 1,
              borderRadius: "10px",
              background:
                "linear-gradient(90deg, transparent, #e53935, transparent)",
            }}
          />
        </Box>
      </CardActionArea>
    </Card>
  );
}