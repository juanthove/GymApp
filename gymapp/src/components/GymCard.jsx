import { Avatar, Card, CardActionArea, CardContent, Typography, Box } from "@mui/material";

export default function GymCard({
  title,
  subtitle,
  imageUrl,
  onClick,
  children,
  sx,
  align = "center",
  variant = "default" // 🔥 nueva prop
}) {

  const isCenter = align === "center";

  // 🔥 NUEVO DISEÑO SOLO PARA HOME
  if (variant === "user") {
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
            boxShadow: 6
          },
          ...sx
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
              backgroundColor: "#ccc"
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
              px: 2
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#fff",
                fontWeight: 600,
                textAlign: "center"
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
                background: "linear-gradient(90deg, transparent, #e53935, transparent)"
              }}
            />
          </Box>

        </CardActionArea>
      </Card>
    );
  }

  // 🔥 TU DISEÑO ORIGINAL (NO TOCAR)
  return (
    <Card
      sx={{
        borderRadius: 4,
        height: imageUrl ? 180 : 140,
        transition: "0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6
        },
        ...sx
      }}
    >
      <CardActionArea
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: isCenter ? "center" : "flex-start"
        }}
        onClick={onClick}
      >
        <CardContent
          sx={{
            textAlign: isCenter ? "center" : "left",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: isCenter ? "center" : "flex-start",
            gap: imageUrl ? 1 : 0
          }}
        >
          {imageUrl && (
            <Avatar
              src={imageUrl}
              alt={title || "Usuario"}
              sx={{ width: 64, height: 64 }}
            />
          )}

          {title && (
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          )}

          {subtitle && (
            <Typography component="div" color="text.secondary">
              {subtitle}
            </Typography>
          )}

          {children}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}