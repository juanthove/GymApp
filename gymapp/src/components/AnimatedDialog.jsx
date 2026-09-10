import { Dialog, Box, Typography, DialogContent, DialogActions, Slide } from "@mui/material";
import { forwardRef } from "react";
import CloseButton from "./CloseButton";
import { useDarkMode } from "../context/DarkModeContext";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} timeout={300} {...props} />;
});

export default function AnimatedDialog({
  open,
  onClose,
  onExited,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  titleSize = "1.3rem",
  headerSx = {},
  paperSx = {},
  closeSx = {},
}) {
  const { darkMode } = useDarkMode();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      slots={{
        transition: Transition,
      }}
      slotProps={{
        transition: {
          onExited: onExited,
        },
        paper: {
          sx: {
            borderRadius: 3,
            backgroundColor: darkMode ? "#0f172a" : "#fff",
            color: darkMode ? "#f8fafc" : "#111827",
            boxShadow: darkMode ? "0 10px 40px rgba(2,6,23,0.45)" : "0 10px 40px rgba(0,0,0,0.3)",
            border: darkMode ? "1px solid rgba(148,163,184,0.22)" : "1px solid rgba(0,0,0,0.05)",

            ...paperSx,
          },
        },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          ...headerSx,
        }}
      >
        <Box sx={{ width: 24 }} />

        <Typography
          sx={{
            flex: 1,
            textAlign: "center",
            fontWeight: 600,
            fontSize: titleSize,
          }}
        >
          {title}
        </Typography>

        <CloseButton
          onClick={onClose}
          sx={{
            color: darkMode ? "#f8fafc" : "#666",
            "&:hover": {
              backgroundColor: "transparent",
              color: darkMode ? "#fff" : "#000",
            },
            ...closeSx,
          }}
        />
      </Box>

      {/* CONTENT */}
      <DialogContent sx={{ px: 2, pb: 1 }}>{children}</DialogContent>

      {/* ACTIONS */}
      {actions && (
        <DialogActions
          sx={{
            px: 2,
            pb: 2,
            pt: 1,
            display: "flex",
            gap: 1,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
