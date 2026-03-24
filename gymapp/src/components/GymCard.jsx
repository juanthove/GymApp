import { Avatar, Card, CardActionArea, CardContent, Typography } from "@mui/material";

export default function GymCard({
  title,
  subtitle,
  imageUrl,
  onClick,
  children,
  sx,
  align = "center" // 👈 nueva prop (center | left)
}) {

  const isCenter = align === "center";

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
            <Typography color="text.secondary">
              {subtitle}
            </Typography>
          )}

          {children}

        </CardContent>

      </CardActionArea>

    </Card>
  );
}