// GymCard.jsx
import React from "react";
import PropTypes from "prop-types";
import { Card, CardActionArea, CardContent, Box, Typography } from "@mui/material";

export default function GymCard({
  title,
  subtitle,
  children,
  onClick,
  sx,
  status = "NORMAL", // "COMPLETED", "IN_PROGRESS", "NORMAL"
  showArrow = false,
  variant = "day", // "day" o "exercise"
}) {
  // Base style general de la Card
  const baseStyle = {
    borderRadius: 4,
    position: "relative",
    overflow: "hidden",
    transition: "0.25s",
    cursor: onClick ? "pointer" : "default",
    background: "linear-gradient(180deg, #ffffff, #f5f5f5)",
    border: "1px solid rgba(255,255,255,0.9)",
    boxShadow: `
      0 6px 18px rgba(0,0,0,0.12),
      inset 0 1px 2px rgba(255,255,255,0.8)
    `,
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
    },
    ...sx,
  };

  // Solo para day y status COMPLETED
  if (variant === "day" && status === "COMPLETED") {
    Object.assign(baseStyle, {
      background: "rgba(230, 230, 230, 0.3)", 
      backdropFilter: "blur(12px)", 
      border: "1px solid rgba(255, 255, 255, 0.4)",
      boxShadow: "none", 
      opacity: 1, 

      // Estilo para los textos generales (título, subtítulo)
      "& .MuiTypography-root": {
        color: "rgba(255, 255, 255, 0.85)", // Blanco más sólido para que se lea sobre el fondo claro
        textShadow: "0px 1px 2px rgba(0,0,0,0.2)", // Sombra suave para separar del blanco
      },
      
      // ESTO ES LA CLAVE: Forzamos el color verde para el estado completado
      "& .status-text-completed": {
        color: "#127919 !important", // Un verde oscuro tipo "Forest Green" que resalte sobre blanco
        fontWeight: 800,
        textShadow: "0px 1px 2px rgba(255, 255, 255, 0.41)", // Quitamos la sombra blanca para que no se ensucie
      },

      "&:hover": {
        transform: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      },
    });
  }

  return (
    <Card sx={baseStyle}>
      {/* BRILLO SUPERIOR */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "45%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* SOMBRA INFERIOR */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "30%",
          background: "linear-gradient(to top, rgba(0,0,0,0.08), transparent)",
          pointerEvents: "none",
        }}
      />

      <CardActionArea sx={{ height: "100%" }} onClick={onClick}>
        {variant === "exercise" ? (
          <CardContent sx={{ width: "100%", p: 0 }}>{children}</CardContent>
        ) : (
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              p: 2,
              pr: 6
            }}
          >
            {/* IZQUIERDA: Titulo + Subtitle + children */}
            {/* 🔝 HEADER: título + estado */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                {title && (
                  <Typography fontWeight={700} sx={{ mb: 0.5, fontSize: "1.7rem" }}>
                    {title}
                  </Typography>
                )}

                <Box>
                  {status === "COMPLETED" && (
                    <Typography 
                      className="status-text-completed"
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: "1.1rem",
                        letterSpacing: "0.5px", 
                      }}
                    >
                      ✔ Completado
                    </Typography>
                  )}
                  {status === "IN_PROGRESS" && (
                    <Typography color="warning.main"
                    sx={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      }}
                    >
                      ⏳ En curso
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* 📊 SUBTITLE + contenido */}
              <Box sx={{ mt: 0.5 }}>
                {subtitle && <Box>{subtitle}</Box>}
                {children}
              </Box>

              {showArrow && (
                <Box
                  sx={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))" }}
                  >
                    <defs>
                      <linearGradient id="arrowGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#888" />
                        <stop offset="100%" stopColor="#000" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M8 4L16 12L8 20"
                      stroke="url(#arrowGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Box>
              )}
          </CardContent>
        )}
      </CardActionArea>
    </Card>
  );
}

GymCard.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  subtitle: PropTypes.node,
  children: PropTypes.node,
  onClick: PropTypes.func,
  sx: PropTypes.object,
  status: PropTypes.oneOf(["COMPLETED", "IN_PROGRESS", "NORMAL"]),
  showArrow: PropTypes.bool,
  variant: PropTypes.oneOf(["day", "exercise"]),
};