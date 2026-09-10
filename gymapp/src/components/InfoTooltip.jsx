import { Portal, Paper, Typography } from "@mui/material";

export default function InfoTooltip({
  open,
  text,
  position,
  maxWidth = 320,
  transform = "translate(-50%, -110%)",
  sx = {},
}) {
  if (!open || !text || !position) return null;

  return (
    <Portal>
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          left: position.x,
          top: position.y,
          transform,
          maxWidth,
          p: 2,
          borderRadius: 3,
          zIndex: 99999,
          pointerEvents: "none",
          ...sx,
        }}
      >
        <Typography whiteSpace="pre-wrap">{text}</Typography>
      </Paper>
    </Portal>
  );
}
