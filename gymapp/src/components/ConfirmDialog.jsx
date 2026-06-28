import { Button, Typography } from "@mui/material";
import AnimatedDialog from "./AnimatedDialog";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirmar",
  message,
  confirmText = "Aceptar",
  confirmColor = "primary",
}) {
  return (
    <AnimatedDialog
      open={open}
      onClose={onClose}
      title={title}
      titleSize="1.8rem"
      headerSx={{ mt: 1 }}
      actions={
        <Button variant="contained" color={confirmColor} onClick={onConfirm}>
          {confirmText}
        </Button>
      }
    >
      <Typography sx={{ fontSize: "1.4rem", my: 2 }}>{message}</Typography>
    </AnimatedDialog>
  );
}
