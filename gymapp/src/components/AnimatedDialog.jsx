import {
  Dialog,
  Box,
  Typography,
  DialogContent,
  DialogActions,
  Slide
} from "@mui/material";
import { forwardRef } from "react";
import CloseButton from "./CloseButton";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} timeout={300} {...props} />;
});

export default function AnimatedDialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  titleSize = "1.3rem",
  headerSx = {},
  paperSx = {} // 👈 🔥 clave
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      slots={{
        transition: Transition
      }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            background: "#fff",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",

            // 👇 permite override externo
            ...paperSx
          }
        }
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          ...headerSx
        }}
        
      >
        <Box sx={{ width: 24 }} />

        <Typography
          sx={{
            flex: 1,
            textAlign: "center",
            fontWeight: 600,
            fontSize: titleSize
          }}
        >
          {title}
        </Typography>

        <CloseButton onClick={onClose} />
      </Box>

      {/* CONTENT */}
      <DialogContent sx={{ px: 2, pb: 1 }}>
        {children}
      </DialogContent>

      {/* ACTIONS */}
      {actions && (
        <DialogActions
          sx={{
            px: 2,
            pb: 2,
            pt: 1,
            display: "flex",
            gap: 1
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}