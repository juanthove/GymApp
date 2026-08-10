import { Portal, Paper, Typography } from "@mui/material";

export default function ExerciseTooltip({ open, exercise, position }) {
  if (!open || !exercise) return null;

  return (
    <Portal>
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -110%)",
          maxWidth: 320,
          p: 2,
          borderRadius: 3,
          zIndex: 99999,
          pointerEvents: "none",
        }}
      >
        <Typography whiteSpace="pre-wrap">{exercise.description || "Este ejercicio no tiene descripción."}</Typography>
      </Paper>
    </Portal>
  );
}
