import { Card, Typography, Box } from "@mui/material";
import { useCountUp } from "react-countup";
import { useEffect, useRef, useState } from "react";
import { keyframes } from "@mui/system";


export default function VolumeCard({ value }) {

    const pop = keyframes`
        0% {
            transform: scale(1);
        }
        40% {
            transform: scale(1.12);
        }
        70% {
            transform: scale(0.98);
        }
        100% {
            transform: scale(1);
        }
        `;

    const [animate, setAnimate] = useState(false);

    const countUpRef = useRef(null);

    const { start } = useCountUp({
        ref: countUpRef,
        start: 0,
        end: value,
        duration: 1.2,
        separator: ".",
        startOnMount: false,
        onEnd: () => {
            setAnimate(true);

            // reset para poder repetir si cambia el valor
            setTimeout(() => setAnimate(false), 400);
        }
    });

    useEffect(() => {
        if (value >= 0) {
        start();
        }
    }, [value, start]);

  return (
    <Card
      sx={{
        borderRadius: 4,
        px: 4,
        py: 3,
        width: "100%",
        maxWidth: 520,
        textAlign: "center",
        background: "#f7f7f7",
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)"
      }}
    >
      {/* 🔤 TÍTULO */}
      <Typography
        sx={{
          fontSize: "1.3rem",      // 🔼 más grande
          fontWeight: 600,
          color: "#555",           // 🔽 más oscuro (antes era muy gris claro)
          mb: 1
        }}
      >
        Volumen total levantado
      </Typography>

      {/* ➖ LÍNEA */}
      <Box
        sx={{
          height: "1px",
          width: "100%",
          backgroundColor: "#ddd",
          mb: 2
        }}
      />

      {/* 🔢 VALOR */}
      <Typography
        sx={{
            fontSize: "3.4rem",
            fontWeight: 800,
            color: "#d32f2f",
            lineHeight: 1.25,
            letterSpacing: "0.5px",
            fontFeatureSettings: '"tnum"',
            py: 0.5,
            animation: animate ? `${pop} 0.4s ease-out` : "none"
        }}
        >
        <span ref={countUpRef} />
        {" "}
        <Box
            component="span"
            sx={{
            fontSize: "2.3rem",
            fontWeight: 600,
            ml: 0.5
            }}
        >
            kg
        </Box>
        </Typography>
    </Card>
  );
}